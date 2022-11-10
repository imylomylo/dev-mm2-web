FROM ubuntu:18.04

RUN apt-get update && \
  apt install -y  build-essential python-dev git jq wget curl nano openssh-server ngrep tmux net-tools screen vim

RUN curl -sL https://deb.nodesource.com/setup_13.x -o nodesource_setup.sh && \
  bash nodesource_setup.sh && \
  apt install -y nodejs && \
  npm config set prefix ~/.local && \
  echo "PATH=~/.local/bin/:\$PATH" >> ~/.bashrc

COPY start-webapp.sh /usr/local/bin/entrypoint.sh
CMD ["/usr/local/bin/entrypoint.sh"]
