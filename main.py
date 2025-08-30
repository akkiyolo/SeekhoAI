from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from typing import Optional
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Seekho AI API", version="1.0.0")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Pydantic Models
class CurriculumModule(BaseModel):
    module_id: str
    title: str
    description: str

class LessonResponse(BaseModel):
    title: str
    content: str

class TutorResponse(BaseModel):
    response: str

# Store module titles for lesson generation
MODULE_TITLES = {}

@app.get("/curriculum/{course_name}")
async def get_curriculum(course_name: str):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """You are an expert curriculum designer for rural Indian youth in a context like Kothri Kalan. Create a 7-module curriculum for a 'Solar Panel Technician' course. The output MUST be a valid JSON array where each object has 'module_id', 'title', and 'description' keys. The language should be simple, practical, and encouraging."""
        
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
        
        curriculum_data = json.loads(response_text)
        
        # Store module titles for later use
        for module in curriculum_data:
            MODULE_TITLES[module['module_id']] = module['title']
        
        return curriculum_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating curriculum: {str(e)}")

@app.get("/lesson/{module_id}")
async def get_lesson(module_id: str):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Get module title from stored data or use a default
        module_title = MODULE_TITLES.get(module_id, "Solar Panel Installation")
        
        prompt = f"""You are a friendly teacher explaining a topic to a student in rural India. Generate the lesson content for the module titled '{module_title}'. Use an 8th-grade reading level, Markdown for structure, and simple analogies relevant to village life."""
        
        response = model.generate_content(prompt)
        
        return LessonResponse(
            title=module_title,
            content=response.text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lesson: {str(e)}")

@app.post("/tutor")
async def tutor_chat(
    question: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    try:
        if image:
            # Handle multimodal input with image
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Read image data
            image_data = await image.read()
            
            prompt = f"""You are an expert Solar Technician tutor. A student has sent this image and asked: '{question}'. Analyze the image and provide a helpful, safe, and encouraging answer. Prioritize safety if they are showing something dangerous."""
            
            # Create image part for multimodal input
            image_part = {
                "mime_type": image.content_type,
                "data": image_data
            }
            
            response = model.generate_content([prompt, image_part])
        else:
            # Handle text-only input
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""You are a helpful AI tutor. A student is asking: '{question}'. Answer them clearly and simply."""
            
            response = model.generate_content(prompt)
        
        return TutorResponse(response=response.text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing tutor request: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Seekho AI API is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)