# 🌍 ClimaGrid

ClimaGrid aims to address the challenge of **scaling critical infrastructure systems**—such as water, energy, and waste—in the context of a **net-zero city**, while preserving the **livability and sustainability** of that city.

---

## 🚀 Inspiration

Our inspiration for this project came from the company we selected—**GreenSpan Urban Development**. GreenSpan focuses on building net-zero cities, but often encounters problems with **scalability** and **livability**.

We wanted to develop a tool that not only simulates city growth but also considers **natural and urban factors** in its analysis. As global urban populations surge and green spaces shrink, ClimaGrid aims to offer an innovative and impactful solution to a growing real-world issue.

---

## 🛠️ What It Does

ClimaGrid lets users **build their own virtual grid city** using four tile types:
- 💧 Water  
- 🌳 Green Space  
- 🏠 Low-Density Housing  
- 🏢 High-Density Housing  

Once the grid is built, ClimaGrid:
- Analyzes the **urban heat island effect**
- Estimates **energy usage**
- Measures **pollution**
- Sends the layout to a **diffusion model** to generate a realistic **satellite image** of the custom city

---

## 🧰 How We Built It

- **Frontend:** React + TypeScript  
- **Backend:** Flask + Python  
- **ML Models:** PyTorch  
- **Other tools:** Custom diffusion models and dynamic heatmap generation

---

## 🧗 Challenges We Faced

- The **backend was unstable** at times, causing the frontend to become temporarily unusable
- Our **API crashed**, which halted development and testing for several hours

---

## 🏆 Accomplishments

- Built a **clean, intuitive interface** for city-building
- Successfully overlaid multiple **dynamic heatmaps** that correspond accurately to the user's custom grid
- Generated **realistic satellite-style maps** using diffusion models based on user input

---

## 📚 What We Learned

- How to **train and apply diffusion models** for geospatial visualizations
- Techniques for generating **custom heatmaps**
- How to **integrate frontend, backend, and machine learning models** into one seamless platform

---

## 🔮 What's Next

We're planning to implement a **resource allocation model** that:
- Identifies the most critical zones in a city grid
- Distributes water, energy, and infrastructure resources accordingly
- Aims to **boost livability and environmental balance** by targeting key urban challenges with data-backed solutions

---

## 💡 Try ClimaGrid

> Download the repo and the custom model from the google drive. Switch to the directory and run npm run dev.
> Go to the backend in the main directory.
> Put the model.pth in there.
> Run the command "flask --app backend run".
> Now you can run the site locally.

---

## 📄 License


