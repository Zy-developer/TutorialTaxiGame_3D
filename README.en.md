# Command line instructions

## Git global setup
```
git config --global user.name "曾煜"
git config --global user.email "958255130@qq.com"
```

## Create a new repository
```
git clone git@git.feigo.fun:cocos/FLTankBattle.git
cd FLTankBattle
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master
```

## Existing folder
```
cd existing_folder
git init
git remote add origin git@git.feigo.fun:cocos/FLTankBattle.git
git add .
git commit -m "Initial commit"
git push -u origin master
```

## Existing Git repository
```
cd existing_repo
git remote rename origin old-origin
git remote add origin git@git.feigo.fun:cocos/FLTankBattle.git
git push -u origin --all
git push -u origin --tags
```