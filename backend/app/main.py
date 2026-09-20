from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import (
    auth,
    agences,
    plats,
    commandes,
    dashboard,
    menu_jour,
    avis,
    parametres,
    historique,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cantine Ecobank - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agences.router)
app.include_router(plats.router)
app.include_router(commandes.router)
app.include_router(dashboard.router)
app.include_router(menu_jour.router)
app.include_router(avis.router)
app.include_router(parametres.router)
app.include_router(historique.router)


@app.get("/")
def racine():
    return {"message": "API Cantine Ecobank opérationnelle"}
