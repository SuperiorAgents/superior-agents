FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN pip install --upgrade pip && pip install -r requirements.txt

# RUN python -m nltk.downloader punkt

RUN mkdir /logs

RUN apt update
RUN apt-get install -y supervisor 
COPY ./worker/worker.conf /etc/supervisor/conf.d/

EXPOSE 9030

HEALTHCHECK CMD curl --fail http://localhost:9030/health

RUN chmod a+x script.sh

# CMD ["tail", "-f", "/dev/null"]
CMD ["/app/script.sh"]