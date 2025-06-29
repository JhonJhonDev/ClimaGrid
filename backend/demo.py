import torch
from torchvision.utils import save_image
import matplotlib.pyplot as plt
import numpy as np
from tqdm import tqdm
from model import unet
from scheduler import *
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

#device = "cuda" if torch.cuda.is_available() else "cpu"

#model = unet().to(device)
#model.load_state_dict(torch.load("model.pth", map_location=device))
#model.eval()
device = "cuda" if torch.cuda.is_available() else "cpu"

@torch.no_grad()
def sample(model, img_size=128):
    x = torch.randn(1, 3, img_size, img_size, device=device)
    for t in tqdm(reversed(range(T)), desc="Sampling"):
        t_batch = torch.full((1,), t, device=device, dtype=torch.long)
        noise_pred = model(x, t_batch)
        sqrt_acp = get_index_from_list(sqrt_alphas_cumprod, t_batch, x.shape)
        sqrt_1macp = get_index_from_list(sqrt_one_minus_alphas_cumprod, t_batch, x.shape)
        x0_pred = (x - sqrt_1macp * noise_pred) / sqrt_acp
        x0_pred = x0_pred.clamp(-1, 1)
        beta_t = get_index_from_list(betas, t_batch, x.shape)
        acp_prev = get_index_from_list(alphas_cumprod_prev, t_batch, x.shape)
        alpha_t = get_index_from_list(alphas, t_batch, x.shape)

        coef1 = (beta_t * torch.sqrt(acp_prev)) / (1.0 - get_index_from_list(alphas_cumprod, t_batch, x.shape))
        coef2 = ((1.0 - acp_prev) * torch.sqrt(alpha_t)) / (1.0 - get_index_from_list(alphas_cumprod, t_batch, x.shape))
        posterior_mean = coef1 * x0_pred + coef2 * x
        if t > 0:
            var = get_index_from_list(posterior_variance, t_batch, x.shape)
            noise = torch.randn_like(x)
            x = posterior_mean + torch.sqrt(var) * noise
        else:
            x = posterior_mean

    x = (x.clamp(-1, 1) + 1) * 0.5
    x = np.transpose(x[0].cpu().numpy(),(1,2,0))
    fig, ax = plt.subplots()
    height, width = [128,128]
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1]) 
    ax.imshow(x) 
    # add here
    ax.axis('off') 
    canvas = FigureCanvas(fig)
    canvas.draw()
    image = np.frombuffer(canvas.tostring_argb(), dtype=np.uint8).reshape((height, width, 4))
    # Convert to JSON serializable format
    rgb_pixels = [[[int(pixel[1]), int(pixel[2]), int(pixel[3])] for pixel in row] for row in image]
    plt.close(fig)
    return (rgb_pixels)
#result = sample(model)

#plt.imshow(result)
#plt.axis("off")
#plt.title("DDPM Sample")
#plt.show()
