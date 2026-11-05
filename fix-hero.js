const fs = require("fs");
let c = fs.readFileSync("js/hero.js", "utf8");
// Fix mismatched quote: </article>" -> </article>
c = c.replace("</article>\"", "</article>");
fs.writeFileSync("js/hero.js", c);
console.log("Fixed quote mismatch");
