echo "" > x3.min.js
for f in $(cat compression.txt); do
	java -jar yuicompressor-2.4.8.jar $f -o out.js
	cat out.js >> x3.min.js
done;
rm out.js