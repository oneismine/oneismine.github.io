---
title: Automatically create incrementing git release tags
date: '2019-05-15T14:52:37.121Z'
author: 'Joe'
twitter: 'b0wter'
bio: 'Joe is a C# developer by trade and functional programming enthusiast at night. For more postings, check out his <a href="https://blog.gutsman.de">blog</a>.'
---

I guess just about any developer started out creating releases by hand. Luckily, most of us know enough bash scripting to automate this task.
One step I want to talk about is automatically creating a git tag by looking for a previous tag and increasing its version number by one. If you are not familiar with git tags I suggest you check out [this link](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

## Versioning
This post assumes that you are using [semantic versioning](https://semver.org/) (or any other versioning scheme that relies on three colon-separated numbers). If you don't I suggest you give it a try. Otherwise, you'll have to change a couple of lines of script code.

This is important because we want the script to have the option to create either a major, a minor, or a patch release by simply supplying 'major', 'minor', oder 'patch' as an argument. E.g.:
```
./create_release.sh minor
./create_release.sh patch
```

## Increasing the version number

### Getting the latest tag
The `git describe` command helps us find the most recent tag that is reachable from the current commit. It defaults to only showing _annotated_ tags. If you want it to show unannotated use the parameter `--tags`. Annotated tags contain the tagger name/email and date and have their own cheksum while unannotated tags are basically lightweight labels pointing to a commit.

Here is an example output:
```bash
$ git describe --tags
> 1.0.5-2-gb268537
```
The first part is the name of the tag (up to the first dash) and the latter part is abbreviated object name the tag points to. Since we dont need the object name we can remove it by adding `--abbrev=0` to the command:
```bash
$ git describe --tags --abbrev=0
> 1.0.5
```
You can easily split this up into three parts:
```bash
VERSION_PARTS=(${VERSION//./ })
VPART1=${VERSION_PARTS[0]}
VPART2=${VERSION_PARTS[1]}
VPART3=${VERSION_PARTS[2]}

if [ -z "$VPART1" ]; then
	VPART1=0
fi
if [ -z "$VPART2" ]; then
	VPART1=0
fi
if [ -z "$VPART3" ]; then
	VPART1=0
fi
```
where `$VERSION` is the result of `git describe --tags --abbrev=0`. The `if`-part is important in case you have not created a tag yet. `$VPART1` and/or `$VPART2` may be empty strings depending on what type of release you create (check the listing below to see why).

### Increasing the version number
Using bash's case statement we can easily increment the version number (`$1` refers to the first argument given to the script):
```bash
case $1 in
        patch)
                NEW_PATCH_LEVEL=$((VPART3+1))
                NEW_MINOR_LEVEL=$VPART2
                NEW_MAJOR_LEVEL=$VPART1
                ;;  
        minor)
                NEW_PATCH_LEVEL=0
                NEW_MINOR_LEVEL=$((VPART2+1))
                NEW_MAJOR_LEVEL=$VPART1
                ;;  
        major)
                NEW_PATCH_LEVEL=0
                NEW_MINOR_LEVEL=0
                NEW_MAJOR_LEVEL=$((VPART1+1))
                ;;  
        *)
                echo "You need to specify what kind of release this is. Please add on of the following arguments:"
                echo "    patch, minor or major"
                exit -1
                ;;
esac

NEW_TAG="$NEW_MAJOR_LEVEL.$NEW_MINOR_LEVEL.$NEW_PATCH_LEVEL"
```

### Setting a tag
In the next step we need to check if the current commit already has a tag. We use
```bash
$ git rev-parse HEAD
> b26853718113a65777face86ce42ac10e242f4d2
```
to do so. You can do all sorts of magic things with `rev-parse` but we use it to find the SHA1 hash of the latest commit. You can find more details [here](https://stackoverflow.com/questions/15798862/what-does-git-rev-parse-do). To check wether a commit has been tagged we can make use of `git describe` again. Unfortunately, this will produce an error message if the commit is not tagged. However, this does not affect the script in any way. If you come across an error message like this:
```bash
> fatal: cannot describe '796b9b5ea7a364ce5313286f9aa2cf9fe0566380'
```
that's the reason. Since the tag is written to STDOUT and the error message to STDERR we use a simple `if` to check for a tag:
```bash
if [ -z "$NEEDS_TAG" ]; then
    echo "Adding new tag: $NEW_TAG."
    git tag $NEW_TAG
    git push --tags
else
    echo "This commit has already been tagged."
    exit 1
fi
```
The `-z` makes the if return _true_ if the length of the given string is zero (no tag present). The `exit 1` makes sure that we can catch the "non-tagging" in another script.

That's it. You're done. 8)

## Where to go
This script works best in combination with other scripts. You can easily make a script building and testing your code and the upload a new release on Github, Gitlab or something similar. 

## Complete listing

```bash
#!/usr/bin/env bash

VERSION=`git describe --abbrev=0 --tags`

VERSION_PARTS=(${VERSION//./ })
VPART1=${VERSION_PARTS[0]}
VPART2=${VERSION_PARTS[1]}
VPART3=${VERSION_PARTS[2]}

# Make sure that each part contains a value.
# This is important for creating the first tag.
if [ -z "$VPART1" ]; then
	VPART1=0
fi
if [ -z "$VPART2" ]; then
	VPART1=0
fi

# Increase the version number using the script's argument.
case $1 in
        patch)
                NEW_PATCH_LEVEL=$((VPART3+1))
                NEW_MINOR_LEVEL=$VPART2
                NEW_MAJOR_LEVEL=$VPART1
                ;;  
        minor)
                NEW_PATCH_LEVEL=0
                NEW_MINOR_LEVEL=$((VPART2+1))
                NEW_MAJOR_LEVEL=$VPART1
                ;;  
        major)
                NEW_PATCH_LEVEL=0
                NEW_MINOR_LEVEL=0
                NEW_MAJOR_LEVEL=$((VPART1+1))
                ;;  
        *)
                echo "You need to specify what kind of release this is. Please add on of the following arguments:"
                echo "    patch, minor or major"
                exit -1
                ;;
esac

NEW_TAG="$NEW_MAJOR_LEVEL.$NEW_MINOR_LEVEL.$NEW_PATCH_LEVEL"
echo "Updating $VERSION to $NEW_TAG"

GIT_COMMIT=`git rev-parse HEAD`
NEEDS_TAG=`git describe --contains $GIT_COMMIT`

if [ -z "$NEEDS_TAG" ]; then
    echo "Adding new tag: $NEW_TAG."
    git tag $NEW_TAG
    git push --tags
else
    echo "This commit has already been tagged."
    exit 1
fi
```

