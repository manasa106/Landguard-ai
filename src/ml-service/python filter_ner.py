import pandas as pd
import os

# NASA Global Landslide Catalog
INPUT_FILE = "raw/Global_Landslide_Catalog_Export_rows.csv"

# Output file
OUTPUT_FILE = "landslide_data.csv"

# NER 8 States
NER_STATES = {
    "Arunachal Pradesh",
    "Arunāchal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Meghālaya",
    "Mizoram",
    "Nagaland",
    "Nāgāland",
    "Sikkim",
    "Tripura"
}

print("========================================")
print(" LANDGUARD AI - NER DATA FILTER")
print("========================================")

# Check file
if not os.path.exists(INPUT_FILE):
    print(f"\nERROR: File not found:")
    print(INPUT_FILE)
    print("\nMake sure NASA CSV is inside raw folder.")
    exit()

# Load NASA dataset
print("\nLoading NASA Global Landslide Catalog...")

df = pd.read_csv(INPUT_FILE)

print(f"Total NASA records: {len(df)}")

# Keep India only
india_df = df[
    df["country_name"]
    .astype(str)
    .str.strip()
    .eq("India")
].copy()

print(f"India records: {len(india_df)}")

# Filter NER states
ner_df = india_df[
    india_df["admin_division_name"]
    .astype(str)
    .str.strip()
    .isin(NER_STATES)
].copy()

print(f"NER landslide records: {len(ner_df)}")

# Normalize state names
STATE_NORMALIZATION = {
    "Arunāchal Pradesh": "Arunachal Pradesh",
    "Meghālaya": "Meghalaya",
    "Nāgāland": "Nagaland"
}

ner_df["state"] = (
    ner_df["admin_division_name"]
    .astype(str)
    .str.strip()
    .replace(STATE_NORMALIZATION)
)

# Select useful columns
output_columns = [
    "event_id",
    "event_date",
    "event_time",
    "event_title",
    "location_description",
    "landslide_category",
    "landslide_trigger",
    "landslide_size",
    "landslide_setting",
    "fatality_count",
    "injury_count",
    "country_name",
    "state",
    "longitude",
    "latitude",
    "source_name",
    "source_link"
]

# Keep only columns that exist
output_columns = [
    col for col in output_columns
    if col in ner_df.columns
]

final_df = ner_df[output_columns].copy()

# Remove rows without coordinates
final_df = final_df.dropna(
    subset=["latitude", "longitude"]
)

# Sort by date
if "event_date" in final_df.columns:
    final_df = final_df.sort_values(
        by="event_date",
        ascending=False
    )

# Save
final_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n========================================")
print(" STATE-WISE LANDSLIDE EVENTS")
print("========================================")

state_counts = final_df["state"].value_counts()

for state in [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura"
]:
    count = state_counts.get(state, 0)
    print(f"{state:20} : {count}")

print("\n========================================")
print(" DONE")
print("========================================")

print(f"\nOutput file created:")
print(OUTPUT_FILE)

print(f"\nTotal NER records saved: {len(final_df)}")