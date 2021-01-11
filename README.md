# FBDs
Free Body Diagrams

## Dependencies

There are 4 dependencies 'elementary-rotations', 'homogeneous-transformations', 'lu-decomposition' and 'matrix-computations'.

```bash
https://github.com/PeterTadich/elementary-rotations
https://github.com/PeterTadich/homogeneous-transformations
https://github.com/PeterTadich/lu-decomposition
https://github.com/PeterTadich/matrix-computations
```

## Installation

### Node.js

```bash
npm install https://github.com/PeterTadich/FBDs
```

### Google Chrome Web browser

No installation required for the Google Chrome Web browser.

## How to use

### Node.js

```js
import * as FBDs from 'FBDs';
```

### Google Chrome Web browser

```js
import * as camera from './camera.mjs';
import * as centroids from './centroids.mjs';
import * as CoG from './CoG.mjs';
import * as config from './config.mjs';
import * as geometry from './geometry.mjs';
import * as geometryCanvas from './geometryCanvas.mjs';
import * as kinematics from './kinematics.mjs';
import * as vectors from './vectors.mjs';
```

## Examples

### Node.js (server side)

Copy the following code to index.mjs

```js
import * as kinematics from 'fbds/kinematics.mjs';
import * as vectors from 'fbds/vectors.mjs';

//Tesing 'kinematics':
//   - create the inertial ref. frame
kinematics.inertialFrame();

//   - create the body frame
kinematics.bodyFrame();

//   - create angular velocity frame
kinematics.wrefFrame();

//   - print frames
console.log(kinematics.frame_list);

//Tesing 'vectors':
//   - create a position vector
vectors.createPoint([[0.0],[0.0],[0.0]], 'O'); //'O' for Oscar.
vectors.createPoint([[75.0],[100.0],[0.0]], 'A');
console.log(vectors.point_list);

//   - create the position vectors rA/O, rB/O and rB/A
vectors.createPositionVector(vectors.point_list[0].location, vectors.point_list[1].location, 'rA/O'); // 'O' --> 'A'

//   - create rotation vector
vectors.create_rotation_vector(kinematics.Wref_frame,100.0,[[0.0],[50.0],[0.0]],10,50);

//   - print all the vectors
console.log(vectors.vector_list);
console.log(vectors.rotation_list);
```

Then run:

```bash
npm init -y
npm install https://github.com/PeterTadich/FBDs
node index.mjs
```

If the above does not work, modify the package.json file as follows:
Helpful ref: [https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node-js](https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node-js)

```js
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node --experimental-modules index.mjs"
  },
"type": "module",
```

Now try:

```bash
npm start
```