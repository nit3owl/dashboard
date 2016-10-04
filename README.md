# dashboard
A customizable dashboard built as a learning exercise. This project intentionally avoids use of any external libraries or
frameworks (eg - jQuery, React, Bootstrap) and instead is built soley with vanilla JavaScript and a healthy dose of CSS. 
Because of this, there are many things that are done the 'hard' way and some wheels may be reinvented - but that's the goal!
The HTML is generated with a very basic layout and then programmatically altered via JavaScript as required. This project
utilizes HTML5 and does not support all browsers as it heavily relies upon localStorage to save state.

Please remember, **this is a learning exercise and a work in progress!** For best results, view in the latest Chrome.

##Basics
The basic premise of the dashboard is a simple page that can be customized with various widgets. These widgets can be dragged
arround to different positions as the user desires. The application uses localStorage to save state even after the browser is
closed. The app should remember what widgets the user had loaded including their locations and content.

##Widgets

###Note
The note is a simple textbox where a user can type content. The content will be saved via the save button and reloaded at page
refresh.

###Weather
The weather widget allows the user to search for the current forecast by zipcode/country. It displays the last time the forecast
was loaded. Upon refresh, the app will update a forecast that is 5 minutes old or older.

###Dice
The dice widget gives the user the option of rolling one or two six-sided dice. It renders the dice visually using cavnas.

##Acknowledgements
While this app doesnt use external frameworks, it does rely on the work of more talented arists than I.

General Icons: [Font Awesome](https://fortawesome.github.io/Font-Awesome/icons/)

Weather Icons: [Weather Icons](https://erikflowers.github.io/weather-icons/)

Any code lifted in large part from Stack Overflow or elsewhere (not too much, thankfully) is attributed in the source.