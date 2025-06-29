from torch import nn
import math
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
#embded time buddy
class EmbedTime(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, time):
        device = time.device
        half_dim = self.dim // 2
        embeddings = math.log(10000) / (half_dim - 1)
        embeddings = torch.exp(torch.arange(half_dim, device=device) * -embeddings)
        embeddings = time[:, None] * embeddings[None, :]
        embeddings = torch.cat((embeddings.sin(), embeddings.cos()), dim=-1)
        return embeddings


class unet(nn.Module):
    #this is the worst fucking thing I have ever done
    def __init__(self):
        super().__init__()
        self.relu  = nn.ReLU()
        time_emb_dim = 32
        self.time_embedder = nn.Sequential(
                EmbedTime(time_emb_dim),
                nn.Linear(time_emb_dim, time_emb_dim),
                nn.ReLU()
            )
        # down first block
        self.dconv11 = nn.Conv2d(3, 64, 3, padding=1)
        self.dconv12 = nn.Conv2d(64, 64, 3, padding=1)
        self.m1 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.lin1 = nn.Linear(time_emb_dim, 64)
        # down second block
        self.dconv21 = nn.Conv2d(64, 128, 3, padding=1)
        self.dconv22 = nn.Conv2d(128, 128, 3, padding=1)
        self.m2 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.lin2 = nn.Linear(time_emb_dim, 128)
        # down third block
        self.dconv31 = nn.Conv2d(128, 256, 3, padding=1)
        self.dconv32 = nn.Conv2d(256, 256, 3, padding=1)
        self.m3 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.lin3 = nn.Linear(time_emb_dim, 256)
        # down fourth block
        self.dconv41 = nn.Conv2d(256, 512, 3, padding=1)
        self.dconv42 = nn.Conv2d(512, 512, 3, padding=1)
        self.m4 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.lin4 = nn.Linear(time_emb_dim, 512)
        
        # trans
        self.trans1 = nn.Conv2d(512, 1024, 3, padding=1)
        self.trans2 = nn.Conv2d(1024, 1024, 3, padding=1)
        self.lin5 = nn.Linear(time_emb_dim, 1024)

        # up first block
        self.t1 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.uconv11 = nn.Conv2d(1024, 512, 3, padding=1)
        self.uconv12 = nn.Conv2d(512, 512, 3, padding=1)
        self.linu1 = nn.Linear(time_emb_dim, 512)
        # up second block
        self.t2 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.uconv21 = nn.Conv2d(512, 256, 3, padding=1)
        self.uconv22 = nn.Conv2d(256, 256, 3, padding=1)
        self.linu2 = nn.Linear(time_emb_dim, 256)
        # up third block
        self.t3 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.uconv31 = nn.Conv2d(256, 128, 3, padding=1)
        self.uconv32 = nn.Conv2d(128, 128, 3, padding=1)
        self.linu3 = nn.Linear(time_emb_dim, 128)
        # up forth block
        self.t4 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.uconv41 = nn.Conv2d(128, 64, 3, padding=1)
        self.uconv42 = nn.Conv2d(64, 64, 3, padding=1)
        self.linu4 = nn.Linear(time_emb_dim, 64)

        self.finalconv = nn.Conv2d(64, 3, kernel_size=1)
        
        #down bnorm
        self.bnorm1 = nn.BatchNorm2d(64)
        self.bnorm2 = nn.BatchNorm2d(128)
        self.bnorm3 = nn.BatchNorm2d(256)
        self.bnorm4 = nn.BatchNorm2d(512)
        self.bnorm5 = nn.BatchNorm2d(1024)
        self.bnorm12 = nn.BatchNorm2d(64)
        self.bnorm22 = nn.BatchNorm2d(128)
        self.bnorm32 = nn.BatchNorm2d(256)
        self.bnorm42 = nn.BatchNorm2d(512)
        self.bnorm52 = nn.BatchNorm2d(1024)

        #up bnorm
        self.bnormu4 = nn.BatchNorm2d(64)
        self.bnormu3 = nn.BatchNorm2d(128)
        self.bnormu2 = nn.BatchNorm2d(256)
        self.bnormu1 = nn.BatchNorm2d(512)
        self.bnormu42 = nn.BatchNorm2d(64)
        self.bnormu32 = nn.BatchNorm2d(128)
        self.bnormu22 = nn.BatchNorm2d(256)
        self.bnormu12 = nn.BatchNorm2d(512)
    def forward(self, x, timestep):
        savedout = []
        # 1d
        t = self.time_embedder(timestep)
        curt = self.relu(self.lin1(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnorm12(self.relu(self.dconv11(x)))
        x = x + curt
        x = self.bnorm1(self.relu(self.dconv12(x)))
        savedout.append(x)
        x = self.m1(x)
        # 2d
        curt = self.relu(self.lin2(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnorm22(self.relu(self.dconv21(x)))
        x = x + curt
        x = self.bnorm2(self.relu(self.dconv22(x)))
        savedout.append(x)
        x = self.m2(x)
        # 3d
        curt = self.relu(self.lin3(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnorm32(self.relu(self.dconv31(x)))
        x = x + curt
        x = self.bnorm3(self.relu(self.dconv32(x)))
        savedout.append(x)
        x = self.m3(x)
        # 4d
        curt = self.relu(self.lin4(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnorm42(self.relu(self.dconv41(x)))
        x = x + curt
        x = self.bnorm4(self.relu(self.dconv42(x)))
        savedout.append(x)
        x = self.m4(x)

        #trans
        curt = self.relu(self.lin5(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnorm52(self.relu(self.trans1(x)))
        x = x + curt
        x = self.bnorm5(self.relu(self.trans2(x)))

        #1u
        x = self.t1(x)
        x = torch.cat((x, savedout[3]), dim=1)
        curt = self.relu(self.linu1(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnormu12(self.relu(self.uconv11(x)))
        x = x + curt
        x = self.bnormu1(self.relu(self.uconv12(x)))
        #2u
        x = self.t2(x)
        x = torch.cat((x, savedout[2]), dim=1)
        curt = self.relu(self.linu2(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnormu22(self.relu(self.uconv21(x)))
        x = x + curt
        x = self.bnormu2(self.relu(self.uconv22(x)))
        #3u
        x = self.t3(x)
        x = torch.cat((x, savedout[1]), dim=1)
        curt = self.relu(self.linu3(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnormu32(self.relu(self.uconv31(x)))
        x = x + curt
        x = self.bnormu3(self.relu(self.uconv32(x)))
        #4u
        x = self.t4(x)
        x = torch.cat((x, savedout[0]), dim=1)
        curt = self.relu(self.linu4(t))
        curt = curt[(..., ) + (None, ) * 2]
        x = self.bnormu42(self.relu(self.uconv41(x)))
        x = x + curt
        x = self.bnormu4(self.relu(self.uconv42(x)))

        x = self.finalconv(x)
        return x
model = unet()
print("Num params: ", sum(p.numel() for p in model.parameters()))
model
        
