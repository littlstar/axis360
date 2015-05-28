
[ -z $1 ] && {
  echo >&2 "error: Missing root directory"
  exit 1
}

DIR=$1
DESTINATION="${2:-doc/}"
JS='console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).scripts.join("\n"))'
JSDOC="./node_modules/.bin/jsdoc"

cd "${DIR}"
${JSDOC} -d ${DESTINATION} $(node -e "${JS}" component.json)
