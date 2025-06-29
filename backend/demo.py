import torch
from torchvision.utils import save_image
import matplotlib.pyplot as plt
import numpy as np
from tqdm import tqdm
from model import unet
from scheduler import *

device = "cuda" if torch.cuda.is_available() else "cpu"

model = unet().to(device)
model.load_state_dict(torch.load("model.pth", map_location=device))
model.eval()

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

    return x

sampled = sample(model, img_size=128)

sampled = (sampled.clamp(-1, 1) + 1) * 0.5

save_image(sampled, "generated.png")
plt.imshow(np.transpose(sampled[0].cpu().numpy(), (1,2,0)))
plt.axis("off")
plt.title("DDPM Sample")
plt.show()
