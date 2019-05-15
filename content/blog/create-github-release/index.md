---
title: 'Automatically create GitHub release with shell script'
date: '2019-05-14T22:12:03.284Z'
author: 'Joe'
twitter: 'b0wter'
bio: 'Joe is a C# developer by trade and functional programming enthusiast at night. For more postings, check o    ut his <a href="https://blog.gutsman.de">blog</a>.'
---

## Getting started
This article explains how to use a simple shell script to create a release on GitHub. You don't need to know a lot about shell scripting, the commands are rather simple. However, you should be familiar with bash variables and how to capture the output of shell commands. If you feel like you need additional information contact me on [Twitter](https://twitter.com/b0wter) and check the official GitHub [API docs](https://developer.github.com/v3/).

The first thing you'll need to do is create a _Personal Access Token_ on [GitHub](https://github.com/settings/tokens). This is used to authenticate your script and you should keep this key private. Do **not** make it a part of the repository! The token requires the _repo_ scope. Save the token to a file named "credentials.sh" in the folder where you will be storing your the script. Open the credentials file and prepend the api key like this:

```bash
GITHUB_ACCESS_KEY=491s1oyhe7yiv4ez3opk
```

The example key is just a random string. Your api key will most likely differ in length.

## The script

### External dependencies
We start by defining some variables to make reuse of the script easier:

```bash
PROJECT_NAME=torpedo 		# Name of the project on GitHub.
OWNER=b0wter			# Your username on GitHub.
REMOTE=https://api.github.com   # Github's API endpoint.
```

Then, we will source the crendentials file (`credentials.sh`) that we created earlier. The reason for this is, that we can put the new script under source control without revealing our api key.

```bash
source credentials.sh
```

### Release name
Each release requires a unique name. There are several paths you can take. I suggest you take a look at one of my other blog posts about [automatically creating incrementing git releases](/auto-incrementing-git-releases). This will make things easy, you will only have to source the script:

```bash
source git_release.sh
```

and it will be run automatically, create a new release and store its contents in `$NEW_TAG`. Alternatively you can make the user supply a release name as a parameter to this script. Simply assign the value of the first argument to `$NEW_TAG` and add some error handling.

```bash
$NEW_TAG="$1"
if [ -z "$NEW_TAG" ]; then
	echo "You need to pass this script a release name."
	exit 1
fi
```

### Create the release
This is just how I build one of my .Net core projects. Your project will (most likely) require different steps. Since .Net core allows me to create standalone releases for each architecture my build script creates a release for all of the common architectures (Linux, Windows, OSX).

```bash
VERSIONS=(linux-x64 win10-x64 osx-x64)
mkdir -p out 
cd src/webapi/
dotnet clean
rm -rf out 
for ARCHITECTURE in ${VERSIONS[@]}; do
    echo -e "${CYAN}Publishing for $ARCHITECTURE.${RESET}"
    dotnet publish -c Release -o out/$ARCHITECTURE --self-contained --runtime $ARCHITECTURE
    cd out/$ARCHITECTURE
    ZIP_FILENAME="${PROJECT_NAME}_${ARCHITECTURE}_${NEW_TAG}.zip"
    echo -e "${CYAN}Zipping $ARCHITECTURE release as $ZIP_FILENAME.${RESET}"
    zip -r $ZIP_FILENAME *
    MARKDOWN_URLS="${MARKDOWN_URLS} ${URL}"
    mv $ZIP_FILENAME ../ 
    cd ../..
done
cd ../..
cp src/webapi/**/$PROJECT_NAME*.zip out
```

I will end up with a zip file for each platform.

### Using the GitHub api
Since each release requires a unique name we need to check if our `$NEW_TAG` is already in use:

```bash
RELEASES=$(curl --header "Authorization: token $GITHUB_ACCESS_KEY" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases | jq '.[].tag_name')
```

Let's break this up:

 * `--header "Authorization: token $GITHUB_ACCESS_KEY"` adds a header to the HTTP request. It is required by the api to make sure we are authorized. We populated `$GITHUB_ACCESS_KEY` by sourcing `credentials.sh`.
 * `$REMOTE/repos/$OWNER/$PROJECT_NAME/releases` is the endpoint we need to query a list of releases. Check the [api docs](https://developer.github.com/v3/repos/releases/#list-releases-for-a-repository) for more details.
 * `jq` is a cli tool to work with json. Since the response from GitHub is very lengthy:
 ```json
 [
  {
    "url": "https://api.github.com/repos/octocat/Hello-World/releases/1",
    "html_url": "https://github.com/octocat/Hello-World/releases/v1.0.0",
    "assets_url": "https://api.github.com/repos/octocat/Hello-World/releases/1/assets",
    "upload_url": "https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}",
    "tarball_url": "https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0",
    "zipball_url": "https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0",
    "id": 1,
    "node_id": "MDc6UmVsZWFzZTE=",
    "tag_name": "v1.0.0",
    "target_commitish": "master",
    "name": "v1.0.0",
    "body": "Description of the release",
    "draft": false,
    "prerelease": false,
    "created_at": "2013-02-27T19:35:32Z",
    "published_at": "2013-02-27T19:35:32Z",
    "author": {
      "login": "octocat",
      "id": 1,
      "node_id": "MDQ6VXNlcjE=",
      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
      "gravatar_id": "",
      "url": "https://api.github.com/users/octocat",
      "html_url": "https://github.com/octocat",
      "followers_url": "https://api.github.com/users/octocat/followers",
      "following_url": "https://api.github.com/users/octocat/following{/other_user}",
      "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
      "organizations_url": "https://api.github.com/users/octocat/orgs",
      "repos_url": "https://api.github.com/users/octocat/repos",
      "events_url": "https://api.github.com/users/octocat/events{/privacy}",
      "received_events_url": "https://api.github.com/users/octocat/received_events",
      "type": "User",
      "site_admin": false
    },
    "assets": [
      {
        "url": "https://api.github.com/repos/octocat/Hello-World/releases/assets/1",
        "browser_download_url": "https://github.com/octocat/Hello-World/releases/download/v1.0.0/example.zip",
        "id": 1,
        "node_id": "MDEyOlJlbGVhc2VBc3NldDE=",
        "name": "example.zip",
        "label": "short description",
        "state": "uploaded",
        "content_type": "application/zip",
        "size": 1024,
        "download_count": 42,
        "created_at": "2013-02-27T19:35:32Z",
        "updated_at": "2013-02-27T19:35:32Z",
        "uploader": {
          "login": "octocat",
          "id": 1,
          "node_id": "MDQ6VXNlcjE=",
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
        }
      }
    ]
  }
]
```
We need a way to easily extract the information we need. `jq` works in a similar way to xpath selectors in XML. `'.[].tag_name'` says: give me the value of `tag_name` for all items in the list. Check [this](https://thoughtbot.com/blog/jq-is-sed-for-json) for details.

Now that we have a list of all tag names for our repository we need to check if it contains `$NEW_TAG` and create a new release.

```bash
if [[ $RELEASES != *"$NEW_TAG"* ]]; then
	# Release does NOT exist -> create it!
	echo "The release does not exist, creating a new one."
	curl --request POST --header "Authorization: token $GITHUB_ACCESS_KEY" --header "Content-Type: application/json" --data "{\"tag_name\": \"$NEW_TAG\",\"target_commitish\": \"master\"}" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases | jq '.id'
else
	echo "The release exists."
	exit 1
fi
```

Let's break up the curl command:

 * `--request POST` creating the new release requires is to do a POST
 * `--header "Authorization: token $GITHUB_ACCESS_KEY"` is the same as before
 * `-header "Content-Type: application/json"` we need to tell the endpoint that we're sending a json payload.
 *  `--data "{\"tag_name\": \"$NEW_TAG\",\"target_commitish\": \"master\"}"` is the actual payload. We need to define the name of the new release (`tag_name`) and the `target_commitish`. Quoting from the docs: _Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository's default branch (usually master)._ We simply stick to the default here :)
 * `jq '.id'` piping the return through `jq` allows us to intercept the id of the new release. This can prove handy for debugging and is not required in a "release version" of this script.

### Uploading the assets
Unfortunately, uploading the assets is not as straightforward as you might think. Check the [docs](https://developer.github.com/v3/repos/releases/#upload-a-release-asset). 

#### Getting the upload url
We need to query the api for the _upload url_ for our new release. Here's how you do it, check the [official API documentation](https://developer.github.com/v3/repos/releases/#get-a-release-by-tag-name) for more details:

```bash
UPLOAD_URL=$(curl --header "Authorization: token $GITHUB_ACCESS_KEY" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases/tags/$NEW_TAG | jq '.upload_url' | rev | cut -c15- | rev | cut -c2-)
```

This looks way more complicated than it actually is. A typical result of the `curl` request piped through `jq` looks like this:

```bash
"https://uploads.github.com/repos/b0wter/Torpedo/releases/15239650/assets{?name,label}"
```

We have to remove the double quotes at the beginning and end as well as the `{?name,label}` part. There is a miriad of ways to do this but since this never changes we simply use the `cut` and `rev` command. The latter simply reverses the order of characters makes it easier to cut the right amount of characters without calculating lengths and indices.

```bash
# first rev:
"}lebal,eman?{stessa/05693251/sesaeler/odeproT/retw0b/soper/moc.buhtig.sdaolpu//:sptth"

# cut -c15-
stessa/05693251/sesaeler/odeproT/retw0b/soper/moc.buhtig.sdaolpu//:sptth"

# second rev
"https://uploads.github.com/repos/b0wter/Torpedo/releases/15239650/assets

# cut -c2-
https://uploads.github.com/repos/b0wter/Torpedo/releases/15239650/assets
```
`cut` allows you to specify different types of ranges. Here are some examples:
```bash
# Gets the first six characters. 
$ echo "this_is_an_example" | cut -c-6
> this_i

# Removes the first six characters.
$ echo "this_is_an_example" | cut -c6-
> is_an_example

# Keep a specified interall.
$ echo "this_is_an_example" | cut -c6-10
> is_an

# Single character only.
$ echo "this_is_an_example" | cut -c6
> i
```

Here is an excerpt of the man page to explain how ranges work:

       N      N'th byte, character or field, counted from 1
       N-     from N'th byte, character or field, to end of line
       N-M    from N'th to M'th (included) byte, character or field
       -M     from first to M'th (included) byte, character or field

You can also make it work on bytes or fields by replacing `-c` with `-b` or `-f`.

#### Uploading the assets

You can upload multiple assets for a single release. I'll show this using the assets created by my build process (see _Create the release_).

```bash
for ARCHITECTURE in ${VERSIONS[@]}; do
	echo "Uploading asset for architecture $ARCHITECTURE (version $NEW_TAG)."
	curl --header "Authorization: token $GITHUB_ACCESS_KEY" \
	     --header "Content-Type: application/zip" \
	     --data-binary "@out/torpedo_${ARCHITECTURE}_${NEW_TAG}.zip" \
             $UPLOAD_URL?name=torpedo_${ARCHITECTURE}_${NEW_TAG}.zip
done
```

Let's disect the `curl` command:

 * `--header "Content-Type: application/zip"` sets the content type for the POST request. If you're uploading anything else check [this list](https://www.iana.org/assignments/media-types/media-types.xhtml) for other mime types.
 * `-data-binary "@out/torpedo_${ARCHITECTURE}_${NEW_TAG}.zip"` sets the content body of the POST request. Using `@` will make curl read the contents from a file.
 * `$UPLOAD_URL?name=torpedo_${ARCHITECTURE}_${NEW_TAG}.zip` is the url. Remember that the original upload url ended with `{?name, label}`, telling us that we need to supply at least a `name` argument and optionally a `label`. I am not doing the latter in my example.

That's it, we're done! The new release should now be visible on your project page on GitHub!

## Where to go
This script works best in combination with other scripts. E.g. a build script and a script to [automatically create incrementing git tags](/auto-increment-git-release-tags).

## Complete listing
```bash
#! /usr/bin/env bash

PROJECT_NAME=Your_project_name_on_GitHub
OWNER=Your_username_on_GitHub
REMOTE=https://api.github.com

# This is for MY build process you won't need this.
VERSIONS=(fedora-x64 ubuntu-x64 linux-x64 win10-x64 osx-x64) 

# Includes only one line:
# GITHUB_ACCESS_KEY=my_access_key
# You can create an OAuth key from your profile's developer settings.
source credentials.sh

echo "Set a release name in the script!"
NEW_TAG="Name_me!" # Or use my auto incrementing script mentioned above.

#
# Create binaries. Replace this with your own script.
#
echo "Replace me with yout actual build script!"
source scripts/publish.sh

#
# Create Github release.
#
# Check wether a release with this tag exists.
RELEASES=$(curl --header "Authorization: token $GITHUB_ACCESS_KEY" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases | jq '.[].tag_name')

if [[ $RELEASES != *"$NEW_TAG"* ]]; then
	# Release does NOT exist -> create it!
	echo "The release does not exist, creating a new one."
	curl --request POST --header "Authorization: token $GITHUB_ACCESS_KEY" --header "Content-Type: application/json" --data "{\"tag_name\": \"$NEW_TAG\",\"target_commitish\": \"master\"}" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases | jq '.id'
else
	echo "The release exists."
	exit 1
fi

# Get the upload_url for the release.
UPLOAD_URL=$(curl --header "Authorization: token $GITHUB_ACCESS_KEY" $REMOTE/repos/$OWNER/$PROJECT_NAME/releases/tags/$NEW_TAG | jq '.upload_url' | rev | cut -c15- | rev | cut -c2-)

for ARCHITECTURE in ${VERSIONS[@]}; do
	echo "Uploading asset for architecture $ARCHITECTURE (version $NEW_TAG)."
	curl --header "Authorization: token $GITHUB_ACCESS_KEY" \
	     --header "Content-Type: application/zip" \
	     --data-binary "@out/torpedo_${ARCHITECTURE}_${NEW_TAG}.zip" \
             $UPLOAD_URL?name=torpedo_${ARCHITECTURE}_${NEW_TAG}.zip
done
```
