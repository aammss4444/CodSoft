import fastapi as FastAPI 
from pydantic import BaseModel,Annotated,Field
import json 

app = FastAPI() 

class Patient(BaseModel):

    id: Annotated[str, Field(description="ID of the patient",examples=["P001"])]
    name: str
    age: int
    gender: str
    city: str
    height: float
    weight: float
    