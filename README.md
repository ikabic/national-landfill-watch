<h1 align="center">
    <br>
    <a href="/">
    <img width="1800" src="https://github.com/user-attachments/assets/cc3519e0-4688-46a9-8dba-8f5e82b0fb5c" />
    </a>
    <br>
</h1>

<div align="center">
    <a href="/">Home Page</a> |
    <a href="/">Documentation</a> |
    <a href="/">Demo</a> 
</div>
</div>

<br>

<div align="center">

![license](https://img.shields.io/badge/License-MIT-green)
![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet)
![React](https://img.shields.io/badge/Frontend-React-61dafb)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![status](https://img.shields.io/badge/Status-In%20Development-yellow)

</div>

<p align="center">
  The <strong>National Landfill Watch</strong> application serves as a public platform for raising awareness about the locations, as well as the climatic and local environmental impact, of landfills on the territory of the Republic of Serbia. The app will focus on displaying data collected during the <strong>2025 TIAC student challenge</strong>.
</p>

## Overview

The system is trained on **high-resolution orthophotos** from various countries and then applied to the **entire territory of Serbia** for inference.  
Detected landfills are analyzed, segmented, and presented through an interactive map interface built with **React** and **Leaflet**.

---

## 🌍 Project Goal
The primary goal of this project is to **estimate and visualize methane (CH₄) emissions** produced by landfill sites across Serbia, based on their detected surface area and volume.

More specifically, the project aims to:
- Detect illegal landfill sites from high-resolution aerial imagery.
- Estimate each site’s **surface area, volume, and methane emission potential**.
- Quantify the **environmental impact radius** and nearby risk zones.
- Present the results through a **modern, interactive full-stack web application**.
- Support **data transparency and awareness** regarding landfill-related pollution.

---

## 🧠 Model and Training

### 🟢 Detection – YOLOv11m Model
We use **YOLOv11m** (a mid-size variant of the YOLOv11 family) for **object detection** of potential landfill sites.  
The model is fine-tuned on a **custom aerial imagery dataset** that includes both **positive (landfill)** and **negative (non-landfill)** examples.

| Dataset Split | Positive Samples | Negative Samples | Total Images |
|---------------|------------------|------------------|---------------|
| Train         | TODO             | TODO             | TODO          |
| Validation    | TODO             | TODO             | TODO          |
| Test          | TODO             | TODO             | TODO          |

**Training details:**
- **Input resolution:** 512×512 px
- **Input spatial resolution:** 0.3 - 1 m/pixel
- **Augmentations:** flipping, rotation, color jitter, mosaic  
- **Losses tracked:** box, class, DFL  
- **Training platform:** YOLOv11 (Python)  
- **Inference data:** 1 m/pixel orthophotos of Serbia  
- **Output:** bounding boxes of detected landfill sites  

---

### 🟣 Segmentation – Segment Anything Model (SAM)
After detection, each identified landfill region is further **refined using the Segment Anything Model (SAM).**
This step generates **precise polygon masks** for landfill boundaries, enabling more accurate **area estimation, volume approximation and methane emission calculations.**

The segmentation output is used to compute:
- **Segmentation model:** Meta AI's SAM
- **Input:** YOLO-detected regions cropped from orthophotos
- **Output:** pixel-accurate landfill polygons
- **Purpose:** to support spatial analytics (area, methane output estimation, environmental footprint)

This pipeline allows combining YOLO’s efficient detection with SAM’s accurate segmentation to achieve both **speed** and **geospatial precision** in landfill analysis.

---

## 🧩 System Architecture

The project consists of two main parts:

### 1. Python (AI & Data Processing)
- Used for **model training, inference and data post-processing.
- Runs YOLOv11 detection on imagery datasets
- Applying SAM segmentation on detected bounding boxes
- Calculates geometric features
- Exports results to **CSV** format

### 2. PostgreSQL + PostGIS - Spatial Database
- Stores landfill locations and their geometries
- Enables geospatial queries such as proximity search
- **PostGIS** extension used for geometry indexing
- Database schema includes:
    - **landfills:** core table with coordinates, area, volume...
    - **registry_landfills**: table with data from official registry of Serbian landfills

### 3. Backend (.NET + Python)
- .NET server for handling API requests and data integration.
- Integration with PostgreSQL
- Environmental data aggregation and filtering

### 4. Frontend (React + Leaflet)
- Built with **React** for a responsive and modular UI.
- Uses **Leaflet** for map rendering and spatial visualization.
- Features:
  - Detected landfills (with segmentation overlays)
  - Search functionality
  - Methane emission and impact visualization
  - Detailed landfill info panel

---

## ⚙️ Technologies Used

| Layer | Technologies |
|-------|---------------|
| **AI / ML** | Python, Ultralytics, YOLOv11m, SAM |
| **Backend** | .NET 9 (C#), REST API |
| **Frontend** | React, Leaflet, Axios |

---

## 🚀 Running the Application

### Setup Steps

#### Backend + Frontend
```bash
npm run setup
npm run start
```
