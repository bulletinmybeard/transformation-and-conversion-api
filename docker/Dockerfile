# Download base image ubuntu 16.04.
FROM ubuntu:16.04

MAINTAINER "Robin Schulz <hello@rschu.dev>"

ARG ENVIRONMENT=production
ENV NODE_ENV ${ENVIRONMENT}

ARG REDIS_HOST=""
ENV REDIS_HOST ${REDIS_HOST}

ARG REDIS_PORT=""
ENV REDIS_PORT ${REDIS_PORT}

ARG REDIS_USERNAME=""
ENV REDIS_USERNAME ${REDIS_USERNAME}

ARG REDIS_PASSWORD=""
ENV REDIS_PASSWORD ${REDIS_PASSWORD}

# Copy init script file.
COPY /docker/init.sh /root/init.sh

# Make shell script executable.
RUN chmod +x /root/init.sh

# Install some dependencies.
RUN apt-get update && \
    apt-get install -qqy --no-install-recommends apt-utils \
    build-essential \
    apt-utils \
    tzdata \
    nginx \
    git \
    npm

# Copy nginx config files.
COPY /docker/nginx/default-site.conf /etc/nginx/sites-available/default
COPY /docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY /docker/nginx/proxy-params.conf /etc/nginx/proxy-params.conf
COPY /docker/nginx/nginx.security.conf /etc/nginx/nginx.security.conf

# Fix timezone and datetime
RUN echo "tzdata tzdata/Areas select Europe" > /tmp/preseed.txt; \
    echo "tzdata tzdata/Zones/Europe select Amsterdam" >> /tmp/preseed.txt; \
    debconf-set-selections /tmp/preseed.txt && \
    rm /etc/timezone && \
    rm /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata

# Install supervisor.
RUN apt-get install -y supervisor && \
    mkdir -p /var/log/supervisor

ADD /docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set working directory.
WORKDIR /usr/local/nginx/html

# Use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json ./package.json

# Create npm global folder.
RUN mkdir ~/.npm-global

# Configure npm to use the new directory path.
RUN npm config set prefix '~/.npm-global'

# Add `~/.npm-global` to PATH.
ENV PATH=~/.npm-global/bin:$PATH

# Create environment variable `NPM_CONFIG_PREFIX` with `~/.npm-global`
ENV NPM_CONFIG_PREFIX=~/.npm-global

# Install packages.
RUN npm install --verbose

## Load the project.
COPY ./src/ .

# Clean-up.
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Expose ports.
EXPOSE 8080

# Run supervisor, so we can run multiple services.
CMD ["/root/init.sh"]
