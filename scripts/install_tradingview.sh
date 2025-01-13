#!/bin/sh

remove_if_directory_exists() {
	if [ -d "$1" ]; then rm -Rf "$1"; fi
}

# load environment variables
if [ -f ./.env ]; then
  export $(cat ./.env | sed 's/#.*//g' | xargs)
	# . ./.env
fi

OAUTH_REPOSITORY="https://$GH_ACCESS_TOKEN@github.com/dusaprotocol/charting_library/"
git clone -q --depth 1 $OAUTH_REPOSITORY tv

if [ $? -eq 0 ]; then
    echo "Clone succeeded"
else
    echo "Clone failed"
fi

remove_if_directory_exists "src/charting_library"

mv tv/charting_library src/

remove_if_directory_exists "tv"