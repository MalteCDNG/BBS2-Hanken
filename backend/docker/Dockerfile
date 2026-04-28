FROM python:3.14

WORKDIR /code

COPY ../requirements.txt /code/requirements.txt
COPY ../requirements-rpi.txt /code/requirements-rpi.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements-rpi.txt

COPY ../dependencies /code/dependencies
COPY ../hardware /code/hardware
COPY ../routes /code/routes
COPY ../main.py /code/main.py


CMD ["python", "-m", "uvicorn", "--host", "0.0.0.0", "--port", "9000", "main:app"]
