#!/usr/bin/env python3
"""
GRPO Dataset Combiner

This script combines individual GRPO training examples into a dataset ready for training.
It also converts the data format to match the requirements of the GRPO training process.
"""

import os
import sys
import json
import argparse
import glob
from datetime import datetime
from typing import List, Dict, Any

def load_grpo_examples(directory: str) -> List[Dict[str, Any]]:
    """
    Load all GRPO example files from a directory.
    
    Args:
        directory (str): Path to directory containing GRPO example files
        
    Returns:
        List[Dict[str, Any]]: List of loaded GRPO examples
    """
    examples = []
    pattern = os.path.join(directory, "grpo_example_*.json")
    
    for filepath in glob.glob(pattern):
        try:
            with open(filepath, 'r') as f:
                example = json.load(f)
                examples.append(example)
                print(f"Loaded {filepath}")
        except Exception as e:
            print(f"Error loading {filepath}: {str(e)}")
    
    return examples

def format_examples_for_training(examples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Format GRPO examples for the training process.
    
    Args:
        examples (List[Dict[str, Any]]): List of raw GRPO examples
        
    Returns:
        List[Dict[str, Any]]: Formatted examples ready for training
    """
    formatted_examples = []
    
    for example in examples:
        # Format according to the XML_COT_FORMAT template
        formatted_example = {
            "prompt": example["prompt"],
            "response": f"<reasoning>\n{example['reasoning']}\n</reasoning>\n<answer>\n{example['answer']}\n</answer>",
            "reward": example["reward"],
            "metadata": {
                "reward_components": example["reward_components"],
                "portfolio_change": example["portfolio_end"]["total_value_usd"] - example["portfolio_start"]["total_value_usd"],
                "timestamp": example["timestamp"]
            }
        }
        formatted_examples.append(formatted_example)
    
    return formatted_examples

def save_training_dataset(examples: List[Dict[str, Any]], output_path: str) -> None:
    """
    Save the formatted examples as a GRPO training dataset.
    
    Args:
        examples (List[Dict[str, Any]]): Formatted examples
        output_path (str): Path to save the dataset
    """
    with open(output_path, 'w') as f:
        json.dump(examples, f, indent=2)
    
    print(f"Saved {len(examples)} examples to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Combine GRPO examples into a training dataset")
    parser.add_argument("--input-dir", default="data/grpo", help="Directory containing GRPO example files")
    parser.add_argument("--output", default="", help="Output dataset file path (default: grpo_dataset_YYYYMMDD.json)")
    parser.add_argument("--name", default="trading", help="Name for the dataset")
    
    args = parser.parse_args()
    
    # Load examples
    examples = load_grpo_examples(args.input_dir)
    print(f"Loaded {len(examples)} GRPO examples")
    
    if not examples:
        print("No examples found. Exiting.")
        sys.exit(1)
    
    # Format for training
    formatted_examples = format_examples_for_training(examples)
    
    # Generate output path if not provided
    if not args.output:
        timestamp = datetime.now().strftime("%Y%m%d")
        output_path = f"grpo_dataset_{args.name}_{timestamp}.json"
    else:
        output_path = args.output
    
    # Save the dataset
    save_training_dataset(formatted_examples, output_path)
    
    # Print statistics
    rewards = [example["reward"] for example in examples]
    avg_reward = sum(rewards) / len(rewards) if rewards else 0
    max_reward = max(rewards) if rewards else 0
    min_reward = min(rewards) if rewards else 0
    
    print("\nDataset Statistics:")
    print(f"Number of examples: {len(examples)}")
    print(f"Average reward: {avg_reward:.2f}")
    print(f"Max reward: {max_reward:.2f}")
    print(f"Min reward: {min_reward:.2f}")

if __name__ == "__main__":
    main()