//This module is required to view CoM.

//npm install https://github.com/PeterTadich/matrix-computations

//ECMAScript module

//CoG (Centre of Gravity)

//import * as hlao from 'matrix-computations';
//import * as mcht from 'homogeneous-transformations';
import * as hlao from './modules/hlao.mjs';
import * as mcht from './modules/mcht.mjs';

import * as config from './config.mjs';
import * as vectors from './vectors.mjs';
import * as roids from './centroids.mjs';
import * as geom from './geometry.mjs';
import * as gc from './geometryCanvas.mjs';
import * as cam from './camera.mjs';

//For HTML
/*
draw:<button type="button" onclick="draw_CoM_2D(CoM_2D)">2D</button>
<button type="button" onclick="plot_CoM_circles()">3D</button>
</br>
closest:<button type="button" onclick="closest()">find</button>
gen <button type="button" onclick="find_segments()">segs</button>
plot <button type="button" onclick="plot_segment_points()">segs</button>
chain <button type="button" onclick="chain_segments()">segs</button>
</br>
*/

/*
//step 1: create CoM 3D and CoM 2D
create_CoM(); //3D ('octants')
create_CoM_2D(); //2D

//step 2: draw CoM 3D and CoM 2D
draw_CoM_2D(CoM_2D); //2D
plot_CoM_circles(); //3D

//step 3:
closest();
find_segments();
plot_segment_points();
chain_segments();

//step 4: draw
if(end_points.length === 2){
    draw_octant_new();
} else {
    draw_octant();
}

ctx.clearRect(0, 0, width, height);
change_view();
*/

var timer;
function start(time){
    timer = setInterval(CoGtimer, time);
}
function stop(){
    clearInterval(timer);
}

function CoGtimer(){
    //update_MC();
    
    ctx.clearRect(0, 0, config.width, config.height);
    
    change_view();
    
    //draw_CoM_2D(CoM_2D); // <-- IMPORTANT: required to show points with text
    //plot_CoM_circles(); // <-- IMPORTANT: required to show points with text
    
    //closest();
    //findIntersection();
    
    for(var oct in octant){
        octantBuild = oct;
        findIntersection();
        draw_octant_new();
    }

    //find_segments();
    //plot_segment_points();
    //chain_segments(); //IMPORTANT: uses 'octant.B.points'
    //draw_octant();
    //draw_octant_new();
    /*
    if(end_points.length === 2){
        console.log('here1');
        draw_octant_new();
    } else {
        console.log('here2');
        draw_octant();
    }
    */
    
    /*
    for(var i=0;i<frame_list.length;i=i+1){
        frame_list[i].homogeneous_transformation = frame_rotate(frame_list[i].homogeneous_transformation);
        draw_frame(frame_list[i]);
    }
    */
    
    /*
    for(var i=0;i<arrow_list.length;i=i+1){
        arrow = arrow_list[i];
        xp();
        yp();
        zn();
        plot_arrow();
    }
    */
    
    /*
    //origin
    //point
    ctx.beginPath();
    ctx.arc((inertial_frame.homogeneous_transformation[0][3] + 100), (inertial_frame.homogeneous_transformation[1][3] + 100), w, 0, 2 * Math.PI);
    ctx.stroke(); 
    //write the text
    ctx.fillStyle = "black";
    ctx.fillText(inertial_frame.frame_name, (inertial_frame.homogeneous_transformation[0][3] + 100), (inertial_frame.homogeneous_transformation[1][3] + 100));
    */
}

function generate_CoM(){
    create_CoM();
    create_CoM_2D();
}

//[-1, -20, 7, 50].sort(compareCanonically);
//function compareCanonically(a,b){ //page 288 Speaking JavaScript
//    return a < b ? -1 : (a > b ? 1 : 0);
//}
/*
for(var i=0;i<arrow.head.centroids.length;i=i+1) console.log(arrow.head.centroids[i].face + ": " + arrow.head.centroids[i].cent[2][0]);
arrow.head.centroids.sort(compareCanonically);
for(var i=0;i<arrow.head.centroids.length;i=i+1) console.log(arrow.head.centroids[i].face + ": " + arrow.head.centroids[i].cent[2][0]);
*/
function compareCanonically(a,b){ //modified from: page 288 Speaking JavaScript
    return a.cent[2][0] < b.cent[2][0] ? -1 : (a.cent[2][0] > b.cent[2][0] ? 1 : 0);
}

function plot_CoM_circles(){
    for(var quad in CoM.quadrant){
        gc.plot_circle(CoM.quadrant[quad]);
    }
}

function plot_octant_centroids(){
    for(var oct in octant){
        gc.make_point(octant[oct].centroid);
    }
}

//create CoM - 2D
var CoM_2D = {};
function create_CoM_2D(){
    var debug = 0;

    var origin = [[0.0],[0.0],[0.0]];
    //var radius = 250.0;
    //var total = 15.0;
    var direction = [-1,1,1];
    
    var normal_list = [
        {head: [[0.0],[0.0],[-1.0]], tail: [[0.0],[0.0],[0.0]]}, //circle 1 (Z)
        {head: [[0.0],[1.0],[0.0]], tail: [[0.0],[0.0],[0.0]]}, //circle 2 (Y)
        {head: [[-1.0],[0.0],[0.0]], tail: [[0.0],[0.0],[0.0]]} //circle 3 (X)
    ];
    
    CoM_2D.quadrant = {};
    //   - create the 3 circles
    for(var i=0;i<1;i=i+1){
        //         - create the 4 quadrants
        for(var j=0;j<4;j=j+1){
            var start = j*Math.PI/2.0;
            var finish = start + Math.PI/2.0;
            var quadrant_name = "c" + (i+1).toString() + String.fromCharCode(65 + j);
            CoM_2D.quadrant[quadrant_name] = geom.create_circle(normal_list[i],origin,config.radius,config.total,start,finish,direction[i]);
        }
    }
    
    //include origin
    var o = origin;
    
    var i = 0;
    var hi = normal_list[i].head[0][0];
    var hj = normal_list[i].head[1][0];
    var hk = normal_list[i].head[2][0];
    var ti = normal_list[i].tail[0][0];
    var tj = normal_list[i].tail[1][0];
    var tk = normal_list[i].tail[2][0];
    
    var R = vectors.rotation_matrix(hi, hj, hk, ti, tj, tk);
    var uv = R[0];
    if(debug == 1) console.log("uv: [[" + uv[0][0] + "],[" + uv[1][0] + "],[" + uv[2][0] + "]]");
    var n1 = R[1];
    if(debug == 1) console.log("n1: [[" + n1[0][0] + "],[" + n1[1][0] + "],[" + n1[2][0] + "]]");
    var n2 = R[2];
    if(debug == 1) console.log("n2: [[" + n2[0][0] + "],[" + n2[1][0] + "],[" + n2[2][0] + "]]");
    
    var new_frame = [
        [n1[0][0], n2[0][0], uv[0][0], o[0][0]], //ref: Robotics Vision and Control page 27 (Reading the columns of an orthonormal rotation matrix)
        [n1[1][0], n2[1][0], uv[1][0], o[1][0]],
        [n1[2][0], n2[2][0], uv[2][0], o[2][0]],
        [       0,        0,        0,       1]
    ]
    
    CoM_2D.origin = 
        {
            frame: new_frame,
            location: origin,
            camera_view: hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),[[o[0][0]],[o[1][0]],[o[2][0]],[1.0]]),
            name: 'CoM'
        }
}

function draw_CoM_2D(CoM2D){
    var draw_points = 1;
    var fill_quadrants = 0;
    
    //plot origin point
    make_point(CoM2D.origin);
    
    //plot points
    if(draw_points === 1){
        for(var i=0;i<CoM2D.quadrant.c1A.length;i=i+1){
            make_point(CoM2D.quadrant.c1A[i]);
        }
    }
    //create polyline, close path, fill
    ctx.beginPath();
    ctx.moveTo(CoM2D.origin.camera_view[0][0] + config.width/2, CoM2D.origin.camera_view[1][0] + config.height/2);
    for(var i=0;i<CoM2D.quadrant.c1A.length;i=i+1){
        ctx.lineTo(CoM2D.quadrant.c1A[i].camera_view[0][0] + config.width/2, CoM2D.quadrant.c1A[i].camera_view[1][0] + config.height/2);
    }
    ctx.closePath();
    ctx.stroke();
    if(fill_quadrants === 1){
        //face 'black' or 'white'?
        ctx.fillStyle = "black";
        ctx.fill(); //IMPORTANT: to fill add 'origin'.
    }
    
    //plot points
    if(draw_points === 1){
        for(var i=0;i<CoM2D.quadrant.c1B.length;i=i+1){
            make_point(CoM2D.quadrant.c1B[i]);
        }
    }
    //create polyline, close path, fill
    ctx.beginPath();
    ctx.moveTo(CoM2D.origin.camera_view[0][0] + config.width/2, CoM2D.origin.camera_view[1][0] + config.height/2);
    for(var i=0;i<CoM2D.quadrant.c1B.length;i=i+1){
        ctx.lineTo(CoM2D.quadrant.c1B[i].camera_view[0][0] + config.width/2, CoM2D.quadrant.c1B[i].camera_view[1][0] + config.height/2);
    }
    ctx.closePath();
    ctx.stroke();
    if(fill_quadrants === 1){
        //face 'black' or 'white'?
        ctx.fillStyle = "white";
        ctx.fill();
    }
    
    //plot points
    if(draw_points === 1){
        for(var i=0;i<CoM2D.quadrant.c1C.length;i=i+1){
            make_point(CoM2D.quadrant.c1C[i]);
        }
    }
    //create polyline, close path, fill
    ctx.beginPath();
    ctx.moveTo(CoM2D.origin.camera_view[0][0] + config.width/2, CoM2D.origin.camera_view[1][0] + config.height/2);
    for(var i=0;i<CoM2D.quadrant.c1C.length;i=i+1){
        ctx.lineTo(CoM2D.quadrant.c1C[i].camera_view[0][0] + config.width/2, CoM2D.quadrant.c1C[i].camera_view[1][0] + config.height/2);
    }
    ctx.closePath();
    ctx.stroke();
    if(fill_quadrants === 1){
        //face 'black' or 'white'?
        ctx.fillStyle = "black";
        ctx.fill();
    }
    
    //plot points
    if(draw_points === 1){
        for(var i=0;i<CoM2D.quadrant.c1D.length;i=i+1){
            make_point(CoM2D.quadrant.c1D[i]);
        }
    }
    //create polyline, close path, fill
    ctx.beginPath();
    ctx.moveTo(CoM2D.origin.camera_view[0][0] + config.width/2, CoM2D.origin.camera_view[1][0] + config.height/2);
    for(var i=0;i<CoM2D.quadrant.c1D.length;i=i+1){
        ctx.lineTo(CoM2D.quadrant.c1D[i].camera_view[0][0] + config.width/2, CoM2D.quadrant.c1D[i].camera_view[1][0] + config.height/2);
    }
    ctx.closePath();
    ctx.stroke();
    if(fill_quadrants === 1){
        //face 'black' or 'white'?
        ctx.fillStyle = "white";
        ctx.fill();
    }
}
        
//create CoM
//octant.B.points.forEach((d) => console.log(d.name)); //check names
//octant.B.points.length //48
var CoM = {};
var octant = {};
function create_CoM(){
    var origin = [[0.0],[0.0],[0.0]];
    //var radius = 250.0;
    //var total = 15.0;
    var direction = [-1,1,1];
    
    var normal_list = [
        {head: [[0.0],[0.0],[-1.0]], tail: [[0.0],[0.0],[0.0]]}, //circle 1 (Z)
        {head: [[0.0],[1.0],[0.0]], tail: [[0.0],[0.0],[0.0]]}, //circle 2 (Y)
        {head: [[-1.0],[0.0],[0.0]], tail: [[0.0],[0.0],[0.0]]} //circle 3 (X)
    ];
    
    CoM.quadrant = {};
    //   - create the 3 circles
    for(var i=0;i<3;i=i+1){
        //         - create the 4 quadrants
        for(var j=0;j<4;j=j+1){
            var start = j*Math.PI/2.0;
            var finish = start + Math.PI/2.0;
            var quadrant_name = "c" + (i+1).toString() + String.fromCharCode(65 + j);
            CoM.quadrant[quadrant_name] = geom.create_circle(normal_list[i],origin,config.radius,config.total,start,finish,direction[i]);
        }
    }
    
    //   - create the faces
    //      - octant 'A': c1A + c3D + c2D
    octant.A = {};
    octant.A.points = [];
    octant.A.points = octant.A.points.concat(CoM.quadrant.c1A);
    for(var i=(CoM.quadrant.c3D.length - 1); i>=0; i=i-1){
        octant.A.points.push(CoM.quadrant.c3D[i]);
    }
    octant.A.points = octant.A.points.concat(CoM.quadrant.c2D);
    octant.A.centroid = roids.octant_centroid(octant.A.points,'A');
    //      - octant 'B': c1D + c2D + c3C
    octant.B = {};
    octant.B.points = [];
    octant.B.points = octant.B.points.concat(CoM.quadrant.c1D);
    for(var i=(CoM.quadrant.c2D.length - 1); i>=0; i=i-1){
        octant.B.points.push(CoM.quadrant.c2D[i]);
    }
    for(var i=(CoM.quadrant.c3C.length - 1); i>=0; i=i-1){
        octant.B.points.push(CoM.quadrant.c3C[i]);
    }
    octant.B.centroid = roids.octant_centroid(octant.B.points,'B');
    //      - octant 'C': c1D + c2A + c3B
    octant.C = {};
    octant.C.points = [];
    octant.C.points = octant.C.points.concat(CoM.quadrant.c1D);
    octant.C.points = octant.C.points.concat(CoM.quadrant.c2A);
    octant.C.points = octant.C.points.concat(CoM.quadrant.c3B);
    octant.C.centroid = roids.octant_centroid(octant.C.points,'C');
    //      - octant 'D': c1A + c3A + c2A
    octant.D = {};
    octant.D.points = [];
    octant.D.points = octant.D.points.concat(CoM.quadrant.c1A);
    octant.D.points = octant.D.points.concat(CoM.quadrant.c3A);
    for(var i=(CoM.quadrant.c2A.length - 1); i>=0; i=i-1){
        octant.D.points.push(CoM.quadrant.c2A[i]);
    }
    octant.D.centroid = roids.octant_centroid(octant.D.points,'D');
    //      - octant 'E': c1C + c3B + c2B
    octant.E = {};
    octant.E.points = [];
    octant.E.points = octant.E.points.concat(CoM.quadrant.c1C);
    for(var i=(CoM.quadrant.c3B.length - 1); i>=0; i=i-1){
        octant.E.points.push(CoM.quadrant.c3B[i]);
    }
    octant.E.points = octant.E.points.concat(CoM.quadrant.c2B);
    octant.E.centroid = roids.octant_centroid(octant.E.points,'E');
    //      - octant 'F': c1C + c3C + c2C
    octant.F = {};
    octant.F.points = [];
    octant.F.points = octant.F.points.concat(CoM.quadrant.c1C);
    octant.F.points = octant.F.points.concat(CoM.quadrant.c3C);
    for(var i=(CoM.quadrant.c2C.length - 1); i>=0; i=i-1){
        octant.F.points.push(CoM.quadrant.c2C[i]);
    }
    octant.F.centroid = roids.octant_centroid(octant.F.points,'F');
    //      - octant 'G': c1B + c2C + c3D
    octant.G = {};
    octant.G.points = [];
    octant.G.points = octant.G.points.concat(CoM.quadrant.c1B);
    octant.G.points = octant.G.points.concat(CoM.quadrant.c2C);
    octant.G.points = octant.G.points.concat(CoM.quadrant.c3D);
    octant.G.centroid = roids.octant_centroid(octant.G.points,'G');
    //      - octant 'H': c1B + c2B + c3A
    octant.H = {};
    octant.H.points = [];
    octant.H.points = octant.H.points.concat(CoM.quadrant.c1B);
    for(var i=(CoM.quadrant.c2B.length - 1); i>=0; i=i-1){
        octant.H.points.push(CoM.quadrant.c2B[i]);
    }
    for(var i=(CoM.quadrant.c3A.length - 1); i>=0; i=i-1){
        octant.H.points.push(CoM.quadrant.c3A[i]);
    }
    octant.H.centroid = roids.octant_centroid(octant.H.points,'H');
}
        
//draw CoM
function draw_octant(){
    //            A,B,C,D,E,F,G,H
    var toShow = [1,0,0,0,0,0,0,0];
    
    if(toShow[0]){
        //A
        ctx.beginPath();
        //console.log("START");
        for(var i=0;i<octant.A.points.length;i=i+1){
        //for(var i=0;i<18;i=i+1){
            if(i == 0) ctx.moveTo(octant.A.points[i].camera_view[0][0] + config.width/2, octant.A.points[i].camera_view[1][0] + config.height/2);
            else ctx.lineTo(octant.A.points[i].camera_view[0][0] + config.width/2, octant.A.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.A.points[i].name, (octant.A.points[i].camera_view[0][0] + config.width/2), (octant.A.points[i].camera_view[1][0] + config.height/2));
        }
        //console.log("END");
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "cyan";
        ctx.fill();
    }
    if(toShow[1]){
        //B
        ctx.beginPath();
        for(var i=0;i<octant.B.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.B.points[i].camera_view[0][0] + config.width/2, octant.B.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.B.points[i].camera_view[0][0] + config.width/2, octant.B.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.B.points[i].name, (octant.B.points[i].camera_view[0][0] + config.width/2), (octant.B.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "red";
        ctx.fill();
    }
    if(toShow[2]){
        //C
        ctx.beginPath();
        for(var i=0;i<octant.C.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.C.points[i].camera_view[0][0] + config.width/2, octant.C.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.C.points[i].camera_view[0][0] + config.width/2, octant.C.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.C.points[i].name, (octant.C.points[i].camera_view[0][0] + config.width/2), (octant.C.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "yellow";
        ctx.fill();
    }
    if(toShow[3]){
        //D
        ctx.beginPath();
        for(var i=0;i<octant.D.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.D.points[i].camera_view[0][0] + config.width/2, octant.D.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.D.points[i].camera_view[0][0] + config.width/2, octant.D.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.D.points[i].name, (octant.D.points[i].camera_view[0][0] + config.width/2), (octant.D.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "green";
        ctx.fill();
    }
    if(toShow[4]){
        //E
        ctx.beginPath();
        for(var i=0;i<octant.E.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.E.points[i].camera_view[0][0] + config.width/2, octant.E.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.E.points[i].camera_view[0][0] + config.width/2, octant.E.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.E.points[i].name, (octant.E.points[i].camera_view[0][0] + config.width/2), (octant.E.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "brown";
        ctx.fill();
    }
    if(toShow[5]){
        //F
        ctx.beginPath();
        for(var i=0;i<octant.F.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.F.points[i].camera_view[0][0] + config.width/2, octant.F.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.F.points[i].camera_view[0][0] + config.width/2, octant.F.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.F.points[i].name, (octant.F.points[i].camera_view[0][0] + config.width/2), (octant.F.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "grey";
        ctx.fill();
    }
    if(toShow[6]){
        //G
        ctx.beginPath();
        for(var i=0;i<octant.G.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.G.points[i].camera_view[0][0] + config.width/2, octant.G.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.G.points[i].camera_view[0][0] + config.width/2, octant.G.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.G.points[i].name, (octant.G.points[i].camera_view[0][0] + config.width/2), (octant.G.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "orange";
        ctx.fill();
    }
    if(toShow[7]){
        //H
        ctx.beginPath();
        for(var i=0;i<octant.H.points.length;i=i+1){
            if(i == 0) ctx.moveTo(octant.H.points[i].camera_view[0][0] + config.width/2, octant.H.points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(octant.H.points[i].camera_view[0][0] + config.width/2, octant.H.points[i].camera_view[1][0] + config.height/2);
            ctx.fillText(octant.H.points[i].name, (octant.H.points[i].camera_view[0][0] + config.width/2), (octant.H.points[i].camera_view[1][0] + config.height/2));
        }
        ctx.closePath();
        ctx.stroke();
        //face 'black' or 'white'?
        ctx.fillStyle = "pink";
        ctx.fill();
    }
}

//nodes.forEach((d) => console.log(d)); //check node names
var octantBuild = 'G';
var octantSign = "";
var minusculeDistance = [];
var signChange = 0;
var changeIDs = [];
var nodes = [];
var nodesIndex = [];
function findIntersection(){
    var debug = 0;

    octantSign = "";
    nodes = [];
    nodesIndex = [];
    signChange = 0;
    changeIDs = [];
    outline4 = [];
    
    // -1,  1,  1, -1 working (nodes start negative so first +ive is at index 0)
    //  1, -1, -1,  1 not working
    for(var i=0; i<octant[octantBuild].points.length; i=i+1){
        octantSign = octantSign + ':<' + Math.sign(octant[octantBuild].points[i].camera_view[2][0]) + '>' + octant[octantBuild].points[i].name + ':';
        
        if(Math.sign(octant[octantBuild].points[i].camera_view[2][0]) === 1){
            nodes.push(octant[octantBuild].points[i].name);
            nodesIndex.push(i);
        }
        
        if(i === 0){
            var sign = Math.sign(octant[octantBuild].points[i].camera_view[2][0]);
        } else {
            if(sign !== Math.sign(octant[octantBuild].points[i].camera_view[2][0])){
                if(debug){
                    console.log("sign change at:" + octant[octantBuild].points[i].name);
                    console.log("   - :" + octant[octantBuild].points[i-1].name + ' ' + Math.sign(octant[octantBuild].points[i-1].camera_view[2][0]));
                    console.log("   - :" + octant[octantBuild].points[i].name + ' ' +  Math.sign(octant[octantBuild].points[i].camera_view[2][0]));
                }
                sign = Math.sign(octant[octantBuild].points[i].camera_view[2][0]);
                signChange = signChange + 1;
                changeIDs.push([i-1,i]);
            }
        }
    }
    if(debug) console.log(octantSign);
    
    if(signChange > 0){
        if(debug){
            console.log(octant[octantBuild].points[changeIDs[0][0]].name + " --> " + octant[octantBuild].points[changeIDs[0][1]].name);
            console.log(octant[octantBuild].points[changeIDs[1][0]].name + " --> " + octant[octantBuild].points[changeIDs[1][1]].name);
        }
        //get the two +ive end points
        if(Math.sign(octant[octantBuild].points[changeIDs[0][0]].camera_view[2][0]) === 1) var nodeStartID = changeIDs[0][0];
        else var nodeStartID = changeIDs[0][1];
        if(Math.sign(octant[octantBuild].points[changeIDs[1][0]].camera_view[2][0]) === 1) var nodeEndID = changeIDs[1][0];
        else var nodeEndID = changeIDs[1][1];
        if(debug){
            console.log("start ID: " + octant[octantBuild].points[nodeStartID].name);
            console.log("end ID: " + octant[octantBuild].points[nodeEndID].name);
        }
    
        //plot the two points from 'octant'
        if(debug){
            make_point(octant[octantBuild].points[nodeStartID],colours_more[9]);
            make_point(octant[octantBuild].points[nodeEndID],colours_more[9]);
        }
        
        // plot the two points from CoM_2D
        minusculeDistance = [];
        minusculeDistance.push(tiniestDistance(octantBuild, nodeStartID)[0]); // only get first index from tiniestDistance()
        minusculeDistance.push(tiniestDistance(octantBuild, nodeEndID)[0]); // only get first index from tiniestDistance()
        
        if(debug){
            make_point(CoM_2D.quadrant[minusculeDistance[0].name][minusculeDistance[0].j],colours_more[3]);
            make_point(CoM_2D.quadrant[minusculeDistance[1].name][minusculeDistance[1].j],colours_more[3]);
        }
        
        end_points = [{},{}];
        end_points[0].quadrant = minusculeDistance[0].name;
        end_points[0].idx = minusculeDistance[0].j;
        end_points[1].quadrant = minusculeDistance[1].name;
        end_points[1].idx = minusculeDistance[1].j;
        CoM2DInserts(end_points);
    }
    
    insertionRequired = false;
    checkNodesIndex();
    
    if(octantBuild === 'C') outline4.reverse(); //IMPORTANT: required for octant 'C'
    if(octantBuild === 'D') outline4.reverse(); //IMPORTANT: required for octant 'D'
    if(octantBuild === 'E') outline4.reverse(); //IMPORTANT: required for octant 'E'
    //if(octantBuild === 'G') outline4.reverse(); //IMPORTANT: required for octant 'G'
    if(octantBuild === 'H') outline4.reverse(); //IMPORTANT: required for octant 'H'
    
    octant_new = [];
    nodesIndex.forEach((d, i) => {
        octant_new.push(octant[octantBuild].points[d]);
        if(insertionRequired){
            if(i === insertAtID){
                outline4.forEach((d) => octant_new.push(CoM_2D_points[d - 193]));
            }
        }
    });
    
    if(signChange > 0){
        if(!insertionRequired){
            outline4.forEach((d) => octant_new.push(CoM_2D_points[d - 193]));
        }
    }
}

//are the node IDs in consecutive order
var insertAtID = 0;
var insertionRequired = false;
function checkNodesIndex(){
    for(var i=0;i<(nodesIndex.length - 1); i=i+1){
        if(nodesIndex[i] - nodesIndex[i+1] !== -1){
            //console.log("WARNING: Check mode index.");
            insertAtID = i;
            insertionRequired = true;
        }
    }
}

//create_CoM(); //'octants'
//create_CoM_2D();
//plot_CoM_circles(); //3D
//draw_CoM_2D(CoM_2D);
//closest(); //uncomment 'START' to 'END'
//find_segments();
//plot_segment_points();
//colour ref: https://www.w3schools.com/colors/colors_names.asp
var colours = ['Red','Yellow','Brown','Green','Purple','Pink','Cyan','Orange','Aqua','Blue','Navy','Lime']; //12
var blackWhite = {
    A: 'black',
    B: 'white',
    C: 'black',
    D: 'white',
    E: 'white',
    F: 'black',
    G: 'white',
    H: 'black'
};
var colours_more = colours.concat(colours);
var intersection = [];
function closest(){
    intersection = [];
    for(var oct in octant){
        for(var i=0;i<octant[oct].points.length;i=i+1){
            //get the smallest distance
            var dist = tiniestDistance(oct, i);
            
            intersection.push(
                {
                    octant: oct,
                    point: i,
                    dist: dist[0].dist,
                    quadrant: dist[0].name,
                    idx: dist[0].j
                }
            )
        }
    }
    intersection.sort(compareCanonically_distance);
    
    /*
    console.log("START");
    for(var i=0; i<24; i=i+1){
        console.log("octant['" + intersection[i].octant + "'].points[" + intersection[i].point + "]");
        console.log("   CoM_2D.quadrant." + intersection[i].quadrant + "[" + intersection[i].idx + "]");
        console.log("   distance: " + intersection[i].dist);
        make_point(octant[intersection[i].octant].points[intersection[i].point],colours_more[i]);
    }
    console.log("END");
    */
}
        
function tiniestDistance(oct, i){
    var dist_c1A = Number.MAX_VALUE;
    var dist_c1B = Number.MAX_VALUE;
    var dist_c1C = Number.MAX_VALUE;
    var dist_c1D = Number.MAX_VALUE;
    var idx_j_A = 'undefined';
    var idx_j_B = 'undefined';
    var idx_j_C = 'undefined';
    var idx_j_D = 'undefined';
    for(var j=0;j<CoM_2D.quadrant.c1A.length;j=j+1){ //IMPORTANT: assuming 'c1A' has the same count as 'c1B' etc.
        var dist_A = Math.pow(
            (
                Math.pow((octant[oct].points[i].camera_view[0][0] - CoM_2D.quadrant.c1A[j].camera_view[0][0]),2) + //x
                Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1A[j].camera_view[1][0]),2)   //y
                //Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1A[j].camera_view[1][0]),2) + //y
                //Math.pow((octant[oct].points[i].camera_view[2][0] - CoM_2D.quadrant.c1A[j].camera_view[2][0]),2)   //z
            ),
            0.5
        );
        if(dist_A < dist_c1A){
            dist_c1A = dist_A;
            idx_j_A = j;
        }
        
        var dist_B = Math.pow(
            (
                Math.pow((octant[oct].points[i].camera_view[0][0] - CoM_2D.quadrant.c1B[j].camera_view[0][0]),2) + //x
                Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1B[j].camera_view[1][0]),2)   //y
                //Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1B[j].camera_view[1][0]),2) + //y
                //Math.pow((octant[oct].points[i].camera_view[2][0] - CoM_2D.quadrant.c1B[j].camera_view[2][0]),2)   //z
            ),
            0.5
        );
        if(dist_B < dist_c1B){
            dist_c1B = dist_B;
            idx_j_B = j;
        }
        
        var dist_C = Math.pow(
            (
                Math.pow((octant[oct].points[i].camera_view[0][0] - CoM_2D.quadrant.c1C[j].camera_view[0][0]),2) + //x
                Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1C[j].camera_view[1][0]),2)   //y
                //Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1C[j].camera_view[1][0]),2) + //y
                //Math.pow((octant[oct].points[i].camera_view[2][0] - CoM_2D.quadrant.c1C[j].camera_view[2][0]),2)   //z
            ),
            0.5
        );
        if(dist_C < dist_c1C){
            dist_c1C = dist_C;
            idx_j_C = j;
        }
        
        var dist_D = Math.pow(
            (
                Math.pow((octant[oct].points[i].camera_view[0][0] - CoM_2D.quadrant.c1D[j].camera_view[0][0]),2) + //x
                Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1D[j].camera_view[1][0]),2)   //y
                //Math.pow((octant[oct].points[i].camera_view[1][0] - CoM_2D.quadrant.c1D[j].camera_view[1][0]),2) + //y
                //Math.pow((octant[oct].points[i].camera_view[2][0] - CoM_2D.quadrant.c1D[j].camera_view[2][0]),2)   //z
            ),
            0.5
        );
        if(dist_D < dist_c1D){
            dist_c1D = dist_D;
            idx_j_D = j;
        }
    }      
    
    var dist = [
        {name: 'c1A', dist: dist_c1A, j: idx_j_A},
        {name: 'c1B', dist: dist_c1B, j: idx_j_B},
        {name: 'c1C', dist: dist_c1C, j: idx_j_C},
        {name: 'c1D', dist: dist_c1D, j: idx_j_D}
    ];
    
    dist.sort(compareCanonically_distance);
    
    return dist;
}

var segments = [];
function find_segments(){
    segments = [];
    //for each octant build the CoM_2D segment
    for(var i=0;i<intersection.length;i=i+1){
        if(intersection[i].octant === octantBuild){
            segments.push(intersection[i]);
        }
    }
}
        
var seg_cnt = 4;
var end_points = [];
var outline = [];
var outline2 = [];
var outline3 = [];
var outline4 = [];
var start_ID = 0;
var end_ID = 0;
var octant_name = "";
var octant_new = [];
var sum1 = 0.0;
var sum2 = 0.0;
var sum1_ids = [];
var sum2_ids = [];
var quads = [];
var octant_ids = [];
var CoM_2D_points = [];
var CoM_2D_segs = [];
var start_gap = 0;
function chain_segments(){
    end_points = [];
    quads = [];
    
    //list the CoM_2D quadrants segments
    for(var i=0;i<seg_cnt;i=i+1){
        quads.push(segments[i].quadrant);
    }
    //create a set ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    quads = [...new Set(quads)];
    
    //for each CoM_2D quadrant find the smallest distance
    //   - if quads.length === 1 --> ignore
    //   - if quads.length === 2
    if((quads.length === 2) || (quads.length === 1)){
        var debug = 0;
        
        var i = 0;
        end_points.push(segments[i]);
        //   - segments[0] is the smallest distance for quads[0]
        /*
        console.log("octant['" + segments[i].octant + "'].points[" + segments[i].point + "]");
        console.log("   CoM_2D.quadrant." + segments[i].quadrant + "[" + segments[i].idx + "]");
        console.log("   distance: " + segments[i].dist);
        */
        //make_point(octant[segments[i].octant].points[segments[i].point],colours_more[i]);
        
        if(quads.length === 2){
            while(segments[i].quadrant !== quads[1]){i=i+1};
            //   - segments[i] is the smallest distance for quads[1]
            end_points.push(segments[i]);
        } else {
            var i = 1;
            end_points.push(segments[i]);
        }
        /*
        console.log("octant['" + segments[i].octant + "'].points[" + segments[i].point + "]");
        console.log("   CoM_2D.quadrant." + segments[i].quadrant + "[" + segments[i].idx + "]");
        console.log("   distance: " + segments[i].dist);
        */
        //make_point(octant[segments[i].octant].points[segments[i].point],colours_more[i]);
        
        //segments extracted from CoM_2D start from smallest octant point index and end at largest octant point index
        //example:
        //   octant['B'].points[28]
        //      CoM_2D.quadrant.c1A[12]
        //      distance: 8.063782718994121
        //   octant['B'].points[2]
        //      CoM_2D.quadrant.c1D[13]
        //      distance: 10.83146832660715
        //   
        //   octant['B'].points[2] --> octant['B'].points[28]
        //   CoM_2D.quadrant.c1D[13] --> CoM_2D.quadrant.c1A[12]
        end_points.sort(compareCanonically_point);
        if(debug == 1) console.log("start point: " + end_points[0].point);
        if(debug == 1) console.log("end   point: " + end_points[1].point);
        
        //step 3: order to draw octant
        //0, 1, 2, 3 ... 32, 33, 34
        //make_point(CoM_2D.quadrant[end_points[0].quadrant][end_points[0].idx], colours_more[3]);
        //make_point(CoM_2D.quadrant[end_points[1].quadrant][end_points[1].idx], colours_more[4]);
        
        start_ID = end_points[0].point;
        end_ID = end_points[1].point;
        octant_name = end_points[0].octant;
        sum1 = 0.0;
        sum2 = 0.0;
        sum1_ids = [];
        sum2_ids = [];
        for(var i=0;i<octant[octant_name].points.length;i=i+1){
            if((i >= start_ID) && (i <= end_ID)){
                if(debug == 1) console.log(i + ": " + octant[octant_name].points[i].camera_view[2][0] + "**");
                sum1 = sum1 + octant[octant_name].points[i].camera_view[2][0];
                sum1_ids.push(i);
            } else {
                if(debug == 1) console.log(i + ": " + octant[octant_name].points[i].camera_view[2][0]);
                sum2 = sum2 + octant[octant_name].points[i].camera_view[2][0];
                sum2_ids.push(i);
            }
        }
        
        //step 4: octant indices to keep/drop
        octant_ids = []
        if(sum1 > sum2){ //keep indices for sum1
            for(var i=0;i<sum1_ids.length;i=i+1){ octant_ids.push(sum1_ids[i]);}
        } else {         //keep indices for sum2
            for(var i=0;i<sum2_ids.length;i=i+1){ octant_ids.push(sum2_ids[i]);}
        }
        if(debug == 1){
            var ids_str = "";
            for(var i=0;i<octant_ids.length;i=i+1){
                ids_str = ids_str + octant_ids[i].toString();
                if(i != (octant_ids.length - 1)) ids_str = ids_str + ",";
            }
            console.log("octant ids: " + ids_str);
        }
        
        //step 5: CoM_2D indices to insert
        CoM2DInserts(end_points);
        
        //step 6: create the new octant
        octant_new = [];
        //   - old octant points
        start_gap = 0;
        for(var i=0;i<octant_ids.length;i=i+1){
            octant_new.push(octant.B.points[octant_ids[i]]);
            //      - check if there is a gap in the array of selected octant points?
            if(start_gap == 0){ //only get first element ID of the gap
                if(octant_ids[i] != (octant_ids[0] + i)){
                    start_gap = i;
                    if(debug == 1) console.log("start gap: " + start_gap);
                }
            }
        }
        //   - CoM_2D points
        CoM_2D_segs = [];
        //for(var i=0;i<outline.length;i=i+1){
        //    CoM_2D_segs.push(CoM_2D_points[parseInt(outline[i]) - 193]);
        //}
        for(var i=0;i<outline4.length;i=i+1){
            CoM_2D_segs.push(CoM_2D_points[outline4[i] - 193]);
        }
        //   - concatenate select 'octant' and 'CoM_2D' points
        octant_new.splice.apply(octant_new,[start_gap,0].concat(CoM_2D_segs)); //ref: https://stackoverflow.com/questions/7032550/javascript-insert-an-array-inside-another-array
    }
}

function CoM2DInserts(end_points){
    var debug = 0;

    //      - build the array of CoM_2D points
    CoM_2D_points = [];
    CoM_2D_points = CoM_2D.quadrant.c1A.concat(CoM_2D.quadrant.c1B.concat(CoM_2D.quadrant.c1C.concat(CoM_2D.quadrant.c1D)));
    //CoM_2D_points.length = 64
    //   - CoM_2D indices
    //      - start name '193' (index 0)
    //      - end name '256' (index 63)
    outline2 = [];
    outline3 = [];
    outline4 = [];
    var start_ID_name = parseInt(CoM_2D.quadrant[end_points[0].quadrant][end_points[0].idx].name);
    var end_ID_name = parseInt(CoM_2D.quadrant[end_points[1].quadrant][end_points[1].idx].name);
    var i = start_ID_name;
    while(i != end_ID_name){
        outline2.push(i);
        i = i + 1;
        if(i == 257) i = 193; //reset
    }
    var i = end_ID_name;
    while(i != start_ID_name){
        outline3.push(i);
        i = i + 1;
        if(i == 257) i = 193; //reset
    }
    //take shortest path
    if(outline2.length <= outline3.length){
        for(var i=0;i<outline2.length;i=i+1){ outline4.push(outline2[i]);}
    } else {
        for(var i=0;i<outline3.length;i=i+1){ outline4.push(outline3[i]);}
    }
    outline4.reverse();
    if(debug == 1) console.log("outline: " + outline4);
}

var check_names = [];
function draw_octant_new(){
    var debug = 0;
    check_names = [];
    ctx.beginPath();
    //console.log("START");
    for(var i=0;i<octant_new.length;i=i+1){
        //if(octant_new[i].camera_view[2][0] >= 0.0){
            check_names.push(octant_new[i].name);
            if(i == 0) ctx.moveTo(octant_new[i].camera_view[0][0] + config.width/2, octant_new[i].camera_view[1][0] + config.height/2);
            else ctx.lineTo(octant_new[i].camera_view[0][0] + config.width/2, octant_new[i].camera_view[1][0] + config.height/2);
            //ctx.fillText(octant_new[i].name, (octant_new[i].camera_view[0][0] + config.width/2), (octant_new[i].camera_view[1][0] + config.height/2));
        //}
    }
    //console.log("END");
    ctx.closePath();
    ctx.stroke();
    //face 'black' or 'white'?
    ctx.fillStyle = "red";
    ctx.fillStyle = blackWhite[octantBuild];
    ctx.fill();
    if(debug == 1) console.log(check_names);
}

function plot_segment_points(){
    for(var i=0;i<seg_cnt;i=i+1){
        /*
        console.log("octant['" + segments[i].octant + "'].points[" + segments[i].point + "]");
        console.log("   CoM_2D.quadrant." + segments[i].quadrant + "[" + segments[i].idx + "]");
        console.log("   distance: " + segments[i].dist);
        */
        make_point(octant[segments[i].octant].points[segments[i].point],colours_more[i]);
    }
}

function compareCanonically_distance(a,b){ //modified from: page 288 Speaking JavaScript
    return a.dist < b.dist ? -1 : (a.dist > b.dist ? 1 : 0);
}

function compareCanonically_point(a,b){ //modified from: page 288 Speaking JavaScript
    return a.point < b.point ? -1 : (a.point > b.point ? 1 : 0);
}

function change_view(){
    //update camera homogeneous transformation
    cam.camera_frame.homogeneous_transformation = hlao.matrix_multiplication(cam.camera_frame.homogeneous_transformation,mcht.trotx(Math.random()/10)); //rotation about local axis
    cam.camera_frame.homogeneous_transformation = hlao.matrix_multiplication(cam.camera_frame.homogeneous_transformation,mcht.troty(Math.random()/10)); //rotation about local axis
    cam.camera_frame.homogeneous_transformation = hlao.matrix_multiplication(cam.camera_frame.homogeneous_transformation,mcht.trotz(Math.random()/10)); //rotation about local axis
    
    //update relative location/orientation to camera
    //   - points
    cam.updateCamera_points();
    //      - plot the points
    gc.plot_points();
    
    //   - roation vectors
    cam.updateCamera_RotationVectors();
    //      - plot rotation vectors
    gc.plot_rotation_vectors();
    
    //   - vectors
    cam.updateCamera_Vectors();
    //      - plot vectors
    gc.plot_vectors();
    
    //   - frames
    cam.updateCamera_Frames();
    //      - plot the frames
    gc.plot_frames();
    
    //   - CoM
    for(var i=0;i<octant.A.points.length;i=i+1){
        octant.A.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.A.points[i].location[0][0]],[octant.A.points[i].location[1][0]],[octant.A.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.B.points.length;i=i+1){
        octant.B.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.B.points[i].location[0][0]],[octant.B.points[i].location[1][0]],[octant.B.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.C.points.length;i=i+1){
        octant.C.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.C.points[i].location[0][0]],[octant.C.points[i].location[1][0]],[octant.C.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.D.points.length;i=i+1){
        octant.D.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.D.points[i].location[0][0]],[octant.D.points[i].location[1][0]],[octant.D.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.E.points.length;i=i+1){
        octant.E.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.E.points[i].location[0][0]],[octant.E.points[i].location[1][0]],[octant.E.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.F.points.length;i=i+1){
        octant.F.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.F.points[i].location[0][0]],[octant.F.points[i].location[1][0]],[octant.F.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.G.points.length;i=i+1){
        octant.G.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.G.points[i].location[0][0]],[octant.G.points[i].location[1][0]],[octant.G.points[i].location[2][0]],[1.0]]
        );
    }
    for(var i=0;i<octant.H.points.length;i=i+1){
        octant.H.points[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
            [[octant.H.points[i].location[0][0]],[octant.H.points[i].location[1][0]],[octant.H.points[i].location[2][0]],[1.0]]
        );
    }
    //      - plot CoM
    //draw_octant();
    //   - CoM octant centroids
    octant.A.centroid = roids.octant_centroid(octant.A.points,'A');
    octant.B.centroid = roids.octant_centroid(octant.B.points,'B');
    //console.log("octant 'B' z: " + octant.B.centroid.camera_view[2][0]);
    octant.C.centroid = roids.octant_centroid(octant.C.points,'C');
    octant.D.centroid = roids.octant_centroid(octant.D.points,'D');
    octant.E.centroid = roids.octant_centroid(octant.E.points,'E');
    octant.F.centroid = roids.octant_centroid(octant.F.points,'F');
    octant.G.centroid = roids.octant_centroid(octant.G.points,'G');
    octant.H.centroid = roids.octant_centroid(octant.H.points,'H');
    //      - plot CoM octant centroids
    plot_octant_centroids();
}

function frame_rotate(T){
    return(hlao.matrix_multiplication(hlao.matrix_multiplication(hlao.matrix_multiplication(T,mcht.trotx(Math.PI/64)),mcht.troty(Math.PI/64)),mcht.trotz(Math.PI/64)));
}

export {
    start,
    stop,
    CoGtimer,
    generate_CoM,
    compareCanonically,
    plot_CoM_circles,
    plot_octant_centroids,
    create_CoM_2D,
    draw_CoM_2D,
    create_CoM,
    draw_octant,
    findIntersection,
    checkNodesIndex,
    closest,
    tiniestDistance,
    find_segments,
    chain_segments,
    CoM2DInserts,
    draw_octant_new,
    plot_segment_points,
    compareCanonically_distance,
    compareCanonically_point,
    change_view,
    frame_rotate
};