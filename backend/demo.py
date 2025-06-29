import torch
from torchvision.utils import save_image
import matplotlib.pyplot as plt
import numpy as np
from tqdm import tqdm
from model import unet
from scheduler import *
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

device = "cuda" if torch.cuda.is_available() else "cpu"

CHAR_TO_RGB = {
    "b": (0.0,   0.0,   1.0),    # blue
    "l": (0.82,  0.83,  0.84),   # light gray
    "d": (0.29,  0.34,  0.39),   # dark gray
    "g": (0.0,   1.0,   0.0),    # green
}

@torch.no_grad()
def sample(model, grid, img_size=128):
    x = torch.randn(1, 3, img_size, img_size, device=device)
    grid_h = len(grid)
    grid_w = len(grid[0]) if grid_h > 0 else 0
    if grid_h > 0 and grid_w > 0:
        cell_h = img_size // grid_h
        cell_w = img_size // grid_w
        grid_tensor = torch.zeros(3, grid_h * cell_h, grid_w * cell_w, device=device)
        for i in range(grid_h):
            for j in range(grid_w):
                ch = grid[i][j]
                color = CHAR_TO_RGB.get(ch, (1.0, 0.0, 0.0))  # fallback red
                c = torch.tensor(color, dtype=torch.float32, device=device) * 2 - 1
                y0, y1 = i * cell_h, (i + 1) * cell_h
                x0, x1 = j * cell_w, (j + 1) * cell_w
                grid_tensor[:, y0:y1, x0:x1] = c.view(3, 1, 1)

        x[:, :, 0 : grid_h * cell_h, 0 : grid_w * cell_w] = grid_tensor

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
    canvas_img = np.transpose(x[0].cpu().numpy(), (1, 2, 0))

    height, width = img_size, img_size
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.imshow(canvas_img)
    ax.axis('off')
    canvas = FigureCanvas(fig)
    canvas.draw()
    image = np.frombuffer(canvas.tostring_argb(), dtype=np.uint8).reshape((height, width, 4))
    rgb_pixels = [[[int(pixel[1]), int(pixel[2]), int(pixel[3])] for pixel in row] for row in image]
    plt.close(fig)
    return rgb_pixels

