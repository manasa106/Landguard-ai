from pathlib import Path
import json
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from joblib import dump


# ============================================================
# LANDGUARD AI - REAL ML TRAINING PIPELINE
# ============================================================

ROOT = Path(__file__).resolve().parent

DATA_FILE = ROOT / "landslide_training_data.csv"
MODEL_FILE = ROOT / "landguard_model.joblib"
META_FILE = ROOT / "model_meta.json"

FEATURES = [
    "rainfall",
    "soilMoisture",
    "slopeAngle",
    "elevation",
    "historicalLandslides",
]

TARGET = "landslide"


# ============================================================
# 1. LOAD DATASET
# ============================================================

if not DATA_FILE.exists():
    raise FileNotFoundError(
        f"\nDataset not found:\n{DATA_FILE}\n\n"
        "Create landslide_training_data.csv first."
    )

df = pd.read_csv(DATA_FILE)

print("\n========================================")
print("       LANDGUARD AI ML TRAINING")
print("========================================")

print(f"\nDataset: {DATA_FILE.name}")
print(f"Rows loaded: {len(df)}")
print(f"Columns: {list(df.columns)}")


# ============================================================
# 2. CHECK REQUIRED COLUMNS
# ============================================================

required = FEATURES + [TARGET]

missing = [column for column in required if column not in df.columns]

if missing:
    raise ValueError(
        "\nMissing required columns:\n"
        + "\n".join(f" - {x}" for x in missing)
        + "\n\nRequired columns are:\n"
        + ", ".join(required)
    )


# ============================================================
# 3. CLEAN DATA
# ============================================================

df = df[required].copy()

for column in required:
    df[column] = pd.to_numeric(df[column], errors="coerce")

before = len(df)

df = df.dropna()

# Valid physical ranges
df = df[
    (df["rainfall"] >= 0)
    & (df["rainfall"] <= 500)
    & (df["soilMoisture"] >= 0)
    & (df["soilMoisture"] <= 100)
    & (df["slopeAngle"] >= 0)
    & (df["slopeAngle"] <= 90)
    & (df["elevation"] >= 0)
    & (df["historicalLandslides"] >= 0)
]

df[TARGET] = df[TARGET].astype(int)

# Only binary labels allowed
df = df[df[TARGET].isin([0, 1])]

after = len(df)

print(f"\nRows after cleaning: {after}")
print(f"Rows removed: {before - after}")


# ============================================================
# 4. DATA VALIDATION
# ============================================================

if len(df) < 100:
    raise ValueError(
        f"\nOnly {len(df)} valid rows available.\n"
        "At least 100 labeled rows are required for this training pipeline."
    )

if df[TARGET].nunique() < 2:
    raise ValueError(
        "\nTarget column must contain BOTH classes:\n"
        "0 = No landslide\n"
        "1 = Landslide"
    )

print("\nTarget distribution:")
print(df[TARGET].value_counts().sort_index())


# ============================================================
# 5. FEATURES + TARGET
# ============================================================

X = df[FEATURES]
y = df[TARGET]


# ============================================================
# 6. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTraining rows:", len(X_train))
print("Testing rows :", len(X_test))


# ============================================================
# 7. RANDOM FOREST MODEL
# ============================================================

model = Pipeline(
    [
        (
            "classifier",
            RandomForestClassifier(
                n_estimators=300,
                max_depth=12,
                min_samples_leaf=2,
                random_state=42,
                class_weight="balanced",
                n_jobs=-1,
            ),
        )
    ]
)


# ============================================================
# 8. TRAIN
# ============================================================

print("\nTraining Random Forest...")

model.fit(X_train, y_train)

print("Training completed successfully.")


# ============================================================
# 9. EVALUATE
# ============================================================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\n========================================")
print("             MODEL RESULTS")
print("========================================")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\nClassification report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0,
    )
)

print("\nConfusion matrix:")
print(confusion_matrix(y_test, predictions))


# ============================================================
# 10. SAVE TRAINED MODEL
# ============================================================

dump(model, MODEL_FILE)

print(f"\nTrained model saved:")
print(MODEL_FILE)


# ============================================================
# 11. SAVE MODEL METADATA
# ============================================================

metadata = {
    "model": "RandomForestClassifier",
    "features": FEATURES,
    "target": TARGET,
    "training_rows": int(len(X_train)),
    "testing_rows": int(len(X_test)),
    "total_valid_rows": int(len(df)),
    "accuracy": round(float(accuracy), 4),
    "random_state": 42,
    "classes": {
        "0": "No landslide",
        "1": "Landslide",
    },
}

META_FILE.write_text(
    json.dumps(metadata, indent=2),
    encoding="utf-8",
)

print(f"Metadata saved:")
print(META_FILE)

print("\n========================================")
print("       LANDGUARD ML READY")
print("========================================\n")