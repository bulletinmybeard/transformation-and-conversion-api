# transformation-and-conversion-api
Image transformation and video conversion API ... (WIP)

# Sample images and sources
All image samples were taken from https://unsplash.com/ (https://unsplash.com/license).

* sample-1.jpg
    * https://unsplash.com/@varietou
    * https://unsplash.com/photos/wSnN6YyG7Nc
* sample-2.jpg
    * https://unsplash.com/@lukasz_rawa
    * https://unsplash.com/photos/mqQp-eFtC7w
* sample-3.jpg
    * https://unsplash.com/@estimated_ch
    * https://unsplash.com/photos/cX1hau3hDyc
* sample-4.jpg
    * https://unsplash.com/@jayphoto
    * https://unsplash.com/photos/T8xWZWrZymk
* sample-5.jpg
    * https://unsplash.com/@joshmillerdp
    * https://unsplash.com/photos/CpZzU7w4Cz4

# TODO
- Make Redis optional and check the environment variables of its existence
- Finish up video conversion feature
- Rewrite regex with number ranges and better grouping
- ~~Rewrite URL path regex to select the source of the image or video:~~ `/<project_name>/<target>/<source>/<actions>/sample-5.jpg`
    - ~~redis (redis cache)~~
    - ~~fs (file system)~~
    - ~~raw (original source without transformations)~~
    - ~~preview (original source with transformations)~~

