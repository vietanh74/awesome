rm -rf dist
mv .env .abc
npm run deploy
mv .abc .env
