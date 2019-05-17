---
title: 'Getting started with automatic releases'
date: '2019-05-14T22:12:03.284Z'
author: 'Joe'
twitter: 'b0wter'
bio: 'Joe is a C# developer by trade and functional programming enthusiast at night. For more postings, check o    ut his <a href="https://blog.gutsman.de">blog</a>.'
---

## Overview
So, you've written your first piece of software and want to show the world or put it to good use? How do you do it? What do you need? This article aims to give you a few hints on what you can do and how it works.

## What you need
* You will need software project that you want to distribute/deploy. If you don't have one yet I suggest you fork a project on GitHub written in the language of your choice and go with that. It's not as nice but will do.
* You need to be familiar enough with your build toolchain that you can invoke the compiler on the command line.
* You need to be using git.

### 1. [Bash on Windows](https://itsfoss.com/install-bash-on-windows/)
Lot's of the automation is done via bash scripting. In previous Windows versions you had to resort to tools like [cygwin](https://www.cygwin.com/). But these come at the disadvantage that all software needs to be recompiled and doesn't necessarily match their Linux versions 1:1. Bash on Windows let's you use the exactly same tools since it runs a complete and tightly integrated Linux distro on Windows (without containers or vms it uses a wrapper to wrap Linux kernel calls into Windows kernel calls). If you're new to Linux I suggest you chose Ubuntu since most of the beginner tutorials focus on that.

### 2. [Why you should automate your development work](https://blog.gutsman.de/auto-increment-git-release-tags)
To get started I suggest you read my blog post about why automation is important and how you can do this on a small scale.

### 3. [Automatically create incrementing git tags](https://blog.gutsman.de/auto-increment-git-release-tags)
Versioning your releases is crucial for all software. Without properly tagging releases you will have a harder time handling reproducing bugs (it's all about recreating the exact same environment that the bug was found in). This article explains how to create a shell script that will automatically create incrementing git tags.

### 4. [Create github release by script](https://blog.gutsman.de/create-github-release)
Creating binaries, zipping them and uploading them to GitHub is a chore. This article explains how to create a shell script that will build, pack and upload your releases to GiHub for you!

### 5. [Create docker hub release by script](https://blog.gutsman.de/create-dockerhub-release)
A lot of times you'll want to deploy your software on a remote machine without knowing the environment 100%. This is where containers come in handy. The article explains how to use docker and bash to create a release on docker hub and deploy it on a remote server.
