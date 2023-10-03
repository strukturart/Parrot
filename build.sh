
#!/bin/bash

# Create default app zip
cd application/
rm ../build/parrot.zip
rm ../build/parrot-kaios3.zip
zip -r ../build/parrot.zip ./*

mv manifest.webapp ../
zip -r ../build/parrot-kaios3.zip ./*
mv ../manifest.webapp ./

# Create bHaCkers zip
rm ../build/parrot-omnisd.zip
zip -r ../build/application.zip ./*
cd ../build/
mkdir -p parrot-omnisd
touch ./parrot-omnisd/metadata.json
echo '{ "version": 1, "manifestURL": "app://parrot/manifest.webapp" }' > ./parrot-omnisd/metadata.json

cp application.zip parrot-omnisd/
cd parrot-omnisd/
zip -r ../parrot-omnisd.zip ./*
rm -fr ../parrot-omnisd
cd ../
rm ./application.zip

# Copy website files to docs directory
cd ..
cp -r application/* docs/
