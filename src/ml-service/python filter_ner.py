import pandas as pd

input_file = "Global_Landslide_Catalog_Export_rows.csv"
output_file = "NER_Landslide_Data.csv"

states = [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura"
]

print("Loading NASA CSV...")

df = pd.read_csv(input_file, low_memory=False)

print("Total NASA records:", len(df))
print("\nColumns:")
print(list(df.columns))

# Search ALL text columns for Northeast state names
text_columns = df.select_dtypes(include="object").columns

combined_text = df[text_columns].fillna("").astype(str).agg(
    " ".join, axis=1
)

pattern = "|".join(states)

ner_df = df[
    combined_text.str.contains(
        pattern,
        case=False,
        regex=True,
        na=False
    )
].copy()

ner_df.to_csv(output_file, index=False)

print("\n==============================")
print("NER FILTER COMPLETE")
print("==============================")

print("NASA records:", len(df))
print("NER records :", len(ner_df))

print("\nState counts:")

for state in states:
    count = combined_text[
        ner_df.index
    ].str.contains(
        state,
        case=False,
        regex=False,
        na=False
    ).sum()

    print(state, ":", count)

print("\nCreated:")
print(output_file)