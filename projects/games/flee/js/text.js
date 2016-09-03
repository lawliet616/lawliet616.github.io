/**
 * Created by Valentin on 2016.02.22..
 */
var m = m || {};
 m.text = function(){
     var color = "#F38630";
     var font = "14px Calibri";
     var key;
     var score;
     var highScore;
     var scoreText;
     var highScoreText;


     var init = function(){
         score = 0;
         scoreText = "SCORE " + score;

         key = "score" + "i" + m.enemy.getInterval() + "r" + m.gift.getRate();
         if(  m.utils.readCookie(key) == null){
             highScore = 0;
         }else{
             highScore = m.utils.readCookie(key).valueOf();
         }

         highScoreText = "HIGHSCORE " + highScore;

         if(m.global.debug) {
             console.log("spawn time: " + m.enemy.getInterval());
             console.log("gift  rate: " + m.gift.getRate());
             console.log("cookie key: " + key);
         }
     };

     var update = function () {
         score++;
         scoreText = "SCORE " + score;
     };

     var draw = function(ctx){
         ctx.fillStyle = color;
         ctx.textAlign = "center";
         ctx.font = font;
         ctx.fillText(scoreText, m.global.displayWidth/2, 14);
         ctx.fillText(highScoreText, m.global.displayWidth/2, m.global.displayHeight - 4);
     };

     return{
         init: init,
         update: update,
         draw: draw,
         setHighscore: function (){
             if(highScore < score){
                 highScore = score;
                 highScoreText = "HIGHSCORE " + highScore;
                 m.utils.createCookie(key,highScore.toString(),10);
             }
         }
     }
 }();