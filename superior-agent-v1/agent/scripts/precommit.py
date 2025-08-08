import json
import subprocess
import hashlib

from pathlib import Path
from src.agent.marketing import MarketingPromptGenerator
from src.agent.trading import TradingPromptGenerator

DATA_FOLDER = "./data"
MARKETING_PROMPT_PATH = "./src/agent/marketing.py"
TRADING_PROMPT_PATH = "./src/agent/trading.py"


def check_file_committed(filepath):
	"""
	Check if a specific file has uncommitted changes.

	Args:
	        filepath (str): Path to the file to check

	Returns:
	        bool: True if file is committed, False if it has uncommitted changes

	Raises:
	        subprocess.CalledProcessError: If git commands fail
	        FileNotFoundError: If file doesn't exist or git is not installed
	"""
	# First check if file exists
	if not Path(filepath).exists():
		raise FileNotFoundError(f"File not found: {filepath}")

	# Check if file has uncommitted changes
	status_cmd = ["git", "status", "--porcelain", filepath]
	status_output = subprocess.check_output(status_cmd, universal_newlines=True).strip()

	# If status_output is empty, file is committed
	return len(status_output) == 0


def get_git_info():
	"""
	Retrieves current git repository information including commit hash,
	branch name, and commit date.

	Returns:
	        dict: Dictionary containing hash, branch, and date information

	Raises:
	        subprocess.CalledProcessError: If git commands fail
	        FileNotFoundError: If git is not installed or directory is not a git repository
	"""
	try:
		# Get the current commit hash
		hash_cmd = ["git", "rev-parse", "HEAD"]
		commit_hash = subprocess.check_output(hash_cmd, universal_newlines=True).strip()

		# Get the current branch name
		branch_cmd = ["git", "rev-parse", "--abbrev-ref", "HEAD"]
		branch = subprocess.check_output(branch_cmd, universal_newlines=True).strip()

		# Get the commit date
		date_cmd = ["git", "log", "-1", "--format=%cd", "--date=iso"]
		date_str = subprocess.check_output(date_cmd, universal_newlines=True).strip()

		return {"hash": commit_hash, "branch": branch, "date": date_str}
	except (subprocess.CalledProcessError, FileNotFoundError) as e:
		raise Exception(
			"Failed to get git information. Make sure you're in a git repository and git is installed."
		) from e


marketing_default_prompts = MarketingPromptGenerator.get_default_prompts()
trading_default_prompts = TradingPromptGenerator.get_default_prompts()

if __name__ == "__main__":
	check_file_committed(TRADING_PROMPT_PATH)
	check_file_committed(MARKETING_PROMPT_PATH)

	marketing_prompt_hash = hashlib.md5(
		json.dumps(marketing_default_prompts, sort_keys=True).encode()
	).hexdigest()
	trading_prompt_hash = hashlib.md5(
		json.dumps(trading_default_prompts, sort_keys=True).encode()
	).hexdigest()

	data = {
		"trading": trading_default_prompts,
		"marketing": marketing_default_prompts,
		"git_info": get_git_info(),
		"marketing_prompt_hash": marketing_prompt_hash,
		"trading_prompt_hash": trading_prompt_hash,
	}

	filepath = Path(DATA_FOLDER) / "prompts.json"
	filepath.write_text(json.dumps(data, indent=4))
	print(f"Completed, wrote into {filepath}")
