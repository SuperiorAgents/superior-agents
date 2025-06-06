import io
import tarfile
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple, cast

import docker
import docker.errors
from docker import DockerClient
from docker.models.containers import Container
from loguru import logger
from result import Err, Ok, Result

from src.helper import timeout


class ContainerManager:
	"""
	Manages Docker containers for executing code in isolated environments.

	This class provides functionality to create, access, and interact with Docker containers.
	It handles container creation if the specified container doesn't exist, and provides
	methods to write and execute code within the container.
	"""

	def __init__(
		self,
		client: DockerClient,
		container_identifier: str,
		host_cache_folder: Path | str,
		in_con_env: Dict[str, str],
	):
		"""
		Initialize the ContainerManager with Docker client and container settings.

		Args:
		    client (DockerClient): Docker client instance for container operations
		    container_identifier (str): Name or ID of the container to use
		    host_cache_folder (Path | str): Path to the folder on the host machine for caching files
		    in_con_env (Dict[str, str]): Environment variables to set in the container

		Raises:
		    ValueError: If the container cannot be found or created, or if the retrieved object is not a Container
		"""
		self.client = client
		self.host_cache_folder = Path(host_cache_folder)

		try:
			_container = client.containers.get(container_identifier)
		except docker.errors.NotFound:
			# If not found, try listing all containers and searching by name
			all_containers = client.containers.list(all=True)
			matching_containers = [
				c for c in all_containers if container_identifier in (c.name, c.id)
			]
			if not matching_containers:
				logger.info(
					f"Container not found: {container_identifier}, attempting to create it"
				)
				try:
					_container = client.containers.create(
						image="superioragents/agent-executor:latest",
						name=container_identifier,
						hostname=container_identifier,
						environment={"PYTHONUNBUFFERED": "1"},
						network_mode="host",
						detach=True,
						restart_policy={"Name": "unless-stopped"},  # type: ignore
					)
					_container.start()
					logger.info(
						f"Successfully created and started container: {container_identifier}"
					)
				except docker.errors.APIError as e:
					logger.error(f"Failed to create container: {container_identifier}")
					logger.error(f"Error: {e}")
					raise ValueError("Container not found and creation failed")
			else:
				_container = matching_containers[0]

		if not isinstance(_container, Container):
			logger.error(f"Retrieved object is not a Container: {container_identifier}")
			raise ValueError("Retrieved object is not a Container")

		self.container = _container
		self.in_con_env = in_con_env

	def write_code_in_con(
		self, code: str, postfix: str, in_container_path: str = "/"
	) -> Tuple[str, str]:
		"""Write code into a temporary file in the host machine first then to the container.

		Algorithm:
		- Write code into a temporary file in the host machine
		- Create a tar archive containing the file
		- Copy the tar archive to the container's root directory
		- Check if the file exists in the container

		Args:
		    code (str): The code to write into the container
		    postfix (str): The type identifier for the agent, used in the file path
		    in_container_path (str, optional): The base path in the container to write the code to. Defaults to "/".

		Raises:
		    Exception: If the file cannot be written to the container or if verification fails

		Returns:
		    Tuple[str, str]:
		        - The path to the temporary file in the container
		        - The reflected code (content of the file as read from the container)
		"""
		# Create temp file name with timestamp
		current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
		temp_file_name = f"temp_script_{current_time}.py"
		temp_file_path = f"{in_container_path}/{temp_file_name}"

		# Create host file path and ensure directory exists
		# logger.info(f"Writing file {temp_file_name} into host machine")
		host_path = self.host_cache_folder / f"temp_codes_{postfix}/{temp_file_name}"
		host_path.parent.mkdir(parents=True, exist_ok=True)
		host_path.write_text(code)

		# Create a tar archive in memory
		tar_stream = io.BytesIO()
		with tarfile.open(fileobj=tar_stream, mode="w") as tar:
			tar.add(host_path, arcname=temp_file_name)
		tar_stream.seek(0)

		# Copy the file to the container's root directory
		# logger.info(f"Writing file {temp_file_name} into container")
		succeed = self.container.put_archive(
			path=in_container_path, data=tar_stream.read()
		)

		if not succeed:
			raise Exception("Failed to write code into the container")

		# Check if file exists in container
		check_exist_command = f"test -f {temp_file_path} && echo 'File exists' || echo 'File does not exist'"
		check_exist_result = self.container.exec_run(
			cmd=["/bin/sh", "-c", check_exist_command]
		)

		if b"File exists" not in check_exist_result.output:
			logger.error(
				f"File verification failed: {check_exist_result.output.decode('utf-8')}"
			)
			raise Exception(
				f"File verification failed: {check_exist_result.output.decode('utf-8')}"
			)

		# Read the file content
		reflected_code = self.container.exec_run(
			cmd=["cat", temp_file_path]
		).output.decode("utf-8")
		assert isinstance(reflected_code, str)

		return temp_file_path, reflected_code

	def run_code_in_con(self, code: str, postfix: str) -> Result[Tuple[str, str], str]:
		"""Run code in container and return the exit code, execution output, and reflected code.

		Algorithm:
		- Write code into a temporary file in the host machine
		- Create a tar archive containing the file
		- Copy the tar archive to the container's root directory
		- Check if the file exists in the container
		- Run the code in the container
		- Return the exit code, execution output, and reflected code

		Args:
		    code (str): The Python code to run in the container
		    postfix (str): The type identifier for the agent, used in the file path

		Returns:
		    Result[Tuple[str, str], str]:
		        - Ok: A tuple containing (execution_output, reflected_code)
		        - Err: An error message describing what went wrong

		Note:
		    - The execution has a timeout of 150 seconds
		    - After execution, any remaining Python processes are killed
		"""
		temp_file_path, reflected_code = self.write_code_in_con(code, postfix)

		# Fix command to use shell redirection properly
		command_str = f"python -u {temp_file_path} 2>&1"  # Use shell syntax
		cmd = ["/bin/sh", "-c", command_str]  # Execute via shell

		try:
			with timeout(seconds=600):
				python_exit_code, python_output = cast(
					Tuple[int, bytes],
					self.container.exec_run(
						cmd=cmd,
						environment=self.in_con_env,
						demux=False,  # Combine stdout and stderr
						stream=False,  # Wait for the command to finish and return all output at once
					),
				)
				python_output_str = python_output.decode("utf-8", errors="replace")
		except TimeoutError as e:
			return Err(
				f"ContainerManager.run_code_in_con: Code ran too long, error: \n{e}"
			)
		except docker.errors.ContainerError as e:
			return Err(
				f"ContainerManager.run_code_in_con: Container error, error: \n{e}"
			)

		self.container.exec_run(cmd="kill -9 $(pidof python)")

		if python_exit_code != 0:
			return Err(
				f"ContainerManager.run_code_in_con: Code that has been run failed, program output: \n{python_output_str}"
			)

		return Ok(
			(
				python_output_str,
				reflected_code,
			)
		)
