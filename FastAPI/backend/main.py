import fastapi as FastAPI 
from pydantic import BaseModel,Annotated,Field
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import json 

app = FastAPI() 

class Patient(BaseModel):

    id: Annotated[str, Field(description="ID of the patient",examples=["P001"])]
    name: Annotated[str, Field(description="Name of the patient")]
    age: Annotated[int, Field(description="Age of the patient",examples=[25])]
    gender: Annotated[  Literal["male","female","other"], Field(description="Gender of the patient",examples=["male"])]
    city: Annotated[str, Field(description="City of the patient",examples=["Mumbai"])]
    height: Annotated[float, Field(..., gt = 0, description="Height of the patient in meters")]
    weight: Annotated[float, Field(..., gt = 0, description="Weight of the patient in kg")]

    @computed_field
    @property
    def bmi(self) -> float:
        return self.weight / (self.height * self.height)
    
    @computed_field
    @property
    def bmi_category(self) -> str:
        if self.bmi < 18.5:
            return "Underweight"
        elif self.bmi < 25:
            return "Normal weight"
        elif self.bmi < 30:
            return "Overweight"
        else:
            return "Obesity"

    def load_data():
        with open("patients.json", "r") as f:
            return json.load(f)
    
    def save_data(data):
        with open("patients.json", "w") as f:
            json.dump(data, f)
    
    @app.post("/create")
    def create_patient(patient: Patient):
        return patient

    data = load_data()

    if patient.id in data:
        raise HTTPException(status_code=400, detail="Patient already exists")
    
    data[patient.id] = patient.model_dump(exclude=['id'])
    save_data(data)
    return JSONResponse(content={"message": "Patient created successfully"})