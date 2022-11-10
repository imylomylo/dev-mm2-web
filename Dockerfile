FROM ubuntu:18.04
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
RUN apt-get update && \
  apt install -y  build-essential python-dev git jq wget curl nano openssh-server ngrep tmux net-tools screen vim

RUN curl -sL https://deb.nodesource.com/setup_13.x -o nodesource_setup.sh && \
  bash nodesource_setup.sh && \
  apt install -y nodejs && \
  npm config set prefix ~/.local && \
  echo "PATH=~/.local/bin/:\$PATH" >> ~/.bashrc

COPY package.json /app/package.json
RUN npm install
RUN npm install @vue/cli@3.7.0 -g

#COPY start-webapp.sh /usr/local/bin/entrypoint.sh
#CMD ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "serve"]
