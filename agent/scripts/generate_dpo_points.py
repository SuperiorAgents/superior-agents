import json
from typing import List, TypedDict
from pathlib import Path
import typer
import os


class DataItem(TypedDict):
	"""Type for representing a single data item extracted from JSONL."""

	prompt: str
	response: str
	score: float


class PreferencePair(TypedDict):
	"""Type for representing a preference pair in the output dataset."""

	prompt: str
	chosen: str
	rejected: str


def extract_data_from_jsonl(file_path: str) -> List[DataItem]:
	"""Extract data from JSONL file with chat histories and scores.

	Args:
		file_path: Path to the JSONL file

	Returns:
		List of data items with prompt, response, and score
	"""
	data: List[DataItem] = []
	with open(file_path, "r", encoding="utf-8") as f:
		for line in f:
			try:
				record = json.loads(line)

				# Extract system and user messages to form the prompt
				chat_history = record.get("chat_history", [])
				system_msg = next(
					(
						msg["content"]
						for msg in chat_history
						if msg.get("role") == "system"
					),
					"",
				)
				user_msg = next(
					(
						msg["content"]
						for msg in chat_history
						if msg.get("role") == "user"
					),
					"",
				)
				prompt = f"{system_msg}\n\n{user_msg}"

				# Extract assistant response
				response = record.get("response", {}).get("content", "")

				# Extract score
				score = record.get("score", 0.0)

				data.append({"prompt": prompt, "response": response, "score": score})
			except json.JSONDecodeError as e:
				print(f"Error decoding JSON in file {file_path}, err: {e}")
			except Exception as e:
				print(f"Error processing line in {file_path}: {e}")

	return data


def create_preference_dataset_cascade(data: List[DataItem]) -> List[PreferencePair]:
	"""Create preference pairs using the cascade method.

	Args:
		data: List of data items with prompt, response, and score

	Returns:
		List of preference pairs with prompt, chosen, and rejected
	"""
	# Sort by score in descending order
	sorted_data = sorted(data, key=lambda x: x["score"], reverse=True)

	preference_pairs: List[PreferencePair] = []
	n = len(sorted_data)

	# For each response (except the lowest scored one)
	for i in range(n - 1):
		# Pair with all lower-scored responses
		for j in range(i + 1, n):
			preference_pairs.append(
				{
					"prompt": sorted_data[i]["prompt"],
					"chosen": sorted_data[i]["response"],
					"rejected": sorted_data[j]["response"],
				}
			)

	return preference_pairs


def process_jsonl_folder(input_folder: str, output_file: str) -> None:
	"""Process all JSONL files in a folder to create a preference dataset.

	Args:
		input_folder: Folder containing JSONL files
		output_file: Path for the output JSONL file
	"""
	input_folder = fix_jsonl(input_folder)

	all_data: List[DataItem] = []

	# Scan folder for JSONL files
	input_path = Path(input_folder)
	jsonl_files = list(input_path.glob("*.jsonl"))

	print(f"Found {len(jsonl_files)} JSONL files in {input_folder}")

	# Process each JSONL file
	for file_path in jsonl_files:
		print(f"Processing {file_path.name}...")
		file_data = extract_data_from_jsonl(str(file_path))
		all_data.extend(file_data)
		print(f"  Extracted {len(file_data)} items")

	# Create preference dataset from all data
	preference_pairs = create_preference_dataset_cascade(all_data)

	# Save as JSONL
	with open(output_file, "w", encoding="utf-8") as f:
		for pair in preference_pairs:
			f.write(json.dumps(pair) + "\n")

	print(
		f"Created {len(preference_pairs)} preference pairs from {len(all_data)} data items."
	)
	print(f"Output saved to {output_file}")


def fix_jsonl(
	input_dir="./data/data_points",
	output_dir=None,
	file_pattern="*.jsonl",
	verbose=False,
	dry_run=False,
) -> str:
	"""
	Fix malformed JSONL files by ensuring each JSON object is on a single line
	with no trailing commas and proper line separation.

	Args:
		input_dir (str): Directory containing the malformed JSONL files
		output_dir (str, optional): Directory to save fixed JSONL files (defaults to input_dir + '_fixed')
		file_pattern (str): File pattern to match JSONL files
		verbose (bool): Enable verbose output
		dry_run (bool): Only analyze files without writing fixes
	"""
	input_dir = Path(input_dir)

	# Set up output directory
	if output_dir is None:
		output_dir = Path(f"{input_dir}_fixed")
	else:
		output_dir = Path(output_dir)

	if not dry_run:
		os.makedirs(output_dir, exist_ok=True)

	# Find all JSONL files in the input directory
	file_paths = list(input_dir.glob(file_pattern))
	print(f"Found {len(file_paths)} JSONL files in {input_dir}")

	total_fixed = 0

	for file_path in file_paths:
		print(f"Processing {file_path.name}...")

		# Read the entire file content
		with open(file_path, "r", encoding="utf-8") as f:
			content = f.read()

		# Try to parse the entire content as a JSON array
		try:
			# First attempt: Check if it's a JSON array
			data_array = json.loads(f"[{content}]")
			if verbose:
				print("  Parsed as JSON array with surrounding brackets")
			fixed_objects = data_array
		except json.JSONDecodeError:
			# Second attempt: Try parsing line by line and fixing each object
			fixed_objects = []
			current_object = ""
			bracket_count = 0
			in_object = False

			lines = content.splitlines()

			for i, line in enumerate(lines):
				line = line.strip()
				if not line:
					continue

				if not in_object and line.startswith("{"):
					in_object = True
					current_object = line
					bracket_count = line.count("{") - line.count("}")
				elif in_object:
					current_object += line
					bracket_count += line.count("{") - line.count("}")

					if bracket_count == 0:
						in_object = False
						try:
							obj = json.loads(current_object)
							fixed_objects.append(obj)
							if verbose:
								print(f"  Successfully parsed object at line {i+1}")
						except json.JSONDecodeError as e:
							if verbose:
								print(f"  Error parsing object: {e}")
						current_object = ""
				elif line.startswith("{"):
					# Start a new object
					in_object = True
					current_object = line
					bracket_count = line.count("{") - line.count("}")

		if verbose:
			print(f"  Found {len(fixed_objects)} valid JSON objects")

		if not fixed_objects:
			print(f"  No valid JSON objects found in {file_path.name}!")
			continue

		# Write the fixed JSONL file
		if not dry_run:
			output_path = output_dir / file_path.name
			with open(output_path, "w", encoding="utf-8") as f:
				for obj in fixed_objects:
					# f.write(json.dumps(obj) + "\n")
					json.dump(obj, f, ensure_ascii=False, sort_keys=True)
					f.write("\n")


			print(f"  Saved fixed file to {output_path}")
			total_fixed += 1

	if dry_run:
		print(f"\nDry run completed. {len(file_paths)} files analyzed.")
	else:
		print(f"\nFixed {total_fixed} out of {len(file_paths)} files.")
	
	return str(output_dir)


def main(
	input_folder: str = typer.Argument(
		"./data/data_points", help="Folder containing JSONL files"
	),
	output_file: str = typer.Argument(
		"./data/dpo/example.jsonl", help="Path for the output JSONL file"
	),
) -> None:
	"""Process JSONL files and create a preference dataset using the cascade method."""
	process_jsonl_folder(input_folder, output_file)


if __name__ == "__main__":
	typer.run(main)
