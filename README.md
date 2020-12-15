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

# URL REST schema
URLs consist of the `project`, `format` (e.g. image or video), `transformation` and `conversation` actions (e.g. resize, crop, etc.), the `source` (e.g. redis, fille system, etc.), and the `file name` and `file extension`.
```
/<project>/<format>/<source>/<actions>/<file_name>.<file_extension>
```

| Path param | Description |
|:----------|:-------------|
| `<project>` | The `<project>` is currently not more than a placeholder and can be used in the future to apply project-related settings. |
| `<format>` | Specifies the format of the given file and can be either `image` or `video`.  |
| `<source>` | Specifies the source of the file and can be either `fs` (file system), `redis` (redis cache), `raw` (original source file), or `preview` (applies transformations/conversion without storing the file in redis or within the file system).  |
| `<actions>` | Specifies, with comma separated actions, the transform/conversion operations we to to apply.  |
| `<file_name>` | ...  |
| `<file_extension>` | image (png, jpe, jpg, jpeg, gif, webp) and video (mov, avi, mpeg, mp4 - WIP!) |

# TODO
- Implement feature to purge a single-file or the entire cache.
- Add more NGINX reverse proxy examples to use the subordinate domain namespace for the project (e.g. `https://<project>.rschu.dev/<preset>/<file_name>.<file_extension>`).
- Finish the presets to use short URLs like `/test/image/fs/pr_featured/sample-5.jpg` or `/test/pr_featured/sample-5.jpg` instead of `/test/image/fs/h_1000,w_1000,r_cover,crop,ch_520,cw_520,oleft_0,otop_0,median/sample-5.jpg`.
- Make Redis optional and check the environment variables of its existence.
- Finish up video conversion feature.
- Rewrite regex with number ranges and better grouping.
- ~~Rewrite URL path regex to select the source of the image or video:~~ `/<project>/<target>/<source>/<actions>/sample-5.jpg`
    - ~~redis (redis cache)~~
    - ~~fs (file system)~~
    - ~~raw (original source without transformations)~~
    - ~~preview (original source with transformations)~~

