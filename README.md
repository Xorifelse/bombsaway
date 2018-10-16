# bombsaway

At Codaisseur we had a game week where we needed to create a multiplayer game with React, Redux and Sockets.
We only had 4 days to work on it and as a basis they gave us a simple tic tac toe game to build upon.

They idea of this game was a childhood memory playing on a 2.86.

# Backend
The backend uses a Typescript koa server with unidirectional socket communication to the clients.

# Frontend
The front end uses React and Konva to handle the drawings. 
The terrain is generated with a 1d perlin algorithm.
