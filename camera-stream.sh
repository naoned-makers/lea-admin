sudo LD_LIBRARY_PATH=/usr/local/lib/ /usr/local/bin/mjpg_streamer -i "input_file.so -f /tmp/ -n camera-out.jpg -d 0,1" -o "output_http.so -w /usr/local/www -p 8090"
