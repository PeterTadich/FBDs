//This module is required to visualise vectors.

//npm install https://github.com/PeterTadich/matrix-computations

//ECMAScript module

//import * as hlao from 'matrix-computations';
//import * as mcht from 'homogeneous-transformations';
import * as hlao from './modules/hlao.mjs';
import * as mcht from './modules/mcht.mjs';
import * as config from './config.mjs';
import * as vectors from './vectors.mjs';
import * as roids from './centroids.mjs';
import * as cam from './camera.mjs';

//store arrowheads
var arrow_list = [];

/*
//demo arrowhead
var arrow = {};
arrow.tail = {};
arrow.head = {};
arrow.tail.points = [[[0],[0],[0]]];
arrow.head.points = [
    [[100],[0],[0]],                     //head
    [[100.0 - 3.0*w],[-w/2.0],[ w/2.0]], //A
    [[100.0 - 3.0*w],[-w/2.0],[-w/2.0]], //B
    [[100.0 - 3.0*w],[ w/2.0],[-w/2.0]], //C
    [[100.0 - 3.0*w],[ w/2.0],[ w/2.0]]  //D
];
arrow.head.faces = arrowhead_faces(arrow);
arrow.head.centroids = arrowhead_face_centroids(arrow);
arrow_list.push(arrow);
*/

function arrowhead_faces(arrow){
    return([
        [arrow.head.points[0],arrow.head.points[4],arrow.head.points[1]], //fa: head, D, A
        [arrow.head.points[0],arrow.head.points[1],arrow.head.points[2]], //fb: head, A, B
        [arrow.head.points[0],arrow.head.points[2],arrow.head.points[3]], //fc: head, B, C
        [arrow.head.points[0],arrow.head.points[3],arrow.head.points[4]], //fd: head, C, D
        [arrow.head.points[1],arrow.head.points[4],arrow.head.points[3],arrow.head.points[2]]  //fe: A, D, C, B
    ]);
}

function arrowhead_face_centroids(arrow){
    return([
        {face: 'fa', ix: 0, cent: roids.triangle_centroid(arrow.head.faces[0])}, //fa
        {face: 'fb', ix: 1, cent: roids.triangle_centroid(arrow.head.faces[1])}, //fb
        {face: 'fc', ix: 2, cent: roids.triangle_centroid(arrow.head.faces[2])}, //fc
        {face: 'fd', ix: 3, cent: roids.triangle_centroid(arrow.head.faces[3])}, //fd
        {face: 'fe', ix: 4, cent: roids.square_centroid(arrow.head.faces[4])}    //fe
    ]);
}

function create_arrow(tail,head,vector_name){
    var debug = 0;
    
    var ti = tail[0]; var tj = tail[1]; var tk = tail[2]; 
    var hi = head[0]; var hj = head[1]; var hk = head[2]; 

    //tail
    /*
    var ti = Number(document.getElementById("ti").value);
    var tj = Number(document.getElementById("tj").value);
    var tk = Number(document.getElementById("tk").value);
    */
    if(debug === 1) console.log("tail: [[" + ti + "],[" + tj + "],[" + tk + "]]");
    //head
    /*
    var hi = Number(document.getElementById("hi").value);
    var hj = Number(document.getElementById("hj").value);
    var hk = Number(document.getElementById("hk").value);
    */
    if(debug === 1) console.log("head: [[" + hi + "],[" + hj + "],[" + hk + "]]");
    
    //calc. mag.
    var di = hi-ti;
    var dj = hj-tj;
    var dk = hk-tk;
    var mag = Math.pow((Math.pow(di,2) + Math.pow(dj,2) + Math.pow(dk,2)),0.5);
    
    var R = vectors.rotation_matrix(hi, hj, hk, ti, tj, tk);
    var uv = R[0];
    var n1 = R[1];
    var n2 = R[2];
    
    //text location
    var tl = hlao.matrix_multiplication_scalar(uv,mag/2.0);
    
    //arrow base
    //   - length
    var ab = hlao.matrix_multiplication_scalar(uv,-3.0*config.w); //IMPORTANT: flip direction
    var mag3 = Math.pow((Math.pow(ab[0][0],2) + Math.pow(ab[1][0],2) + Math.pow(ab[2][0],2)),0.5);
    if(debug === 1) console.log('mag: ' + mag3);
    //   - width
    var w1 = hlao.matrix_multiplication_scalar(n1,config.w);
    var mag4 = Math.pow((Math.pow(w1[0][0],2) + Math.pow(w1[1][0],2) + Math.pow(w1[2][0],2)),0.5);
    if(debug === 1) console.log('mag: ' + mag4);
    var w2 = hlao.matrix_multiplication_scalar(n2,config.w);
    var mag5 = Math.pow((Math.pow(w2[0][0],2) + Math.pow(w2[1][0],2) + Math.pow(w2[2][0],2)),0.5);
    if(debug === 1) console.log('mag: ' + mag5);
    
    var arrow = {}; //clear
    arrow.tail = {};
    arrow.head = {};
    arrow.tail.points = [[[ti],[tj],[tk]]];
    arrow.head.points = [
        [[hi],[hj],[hk]], //head
        [[hi + ab[0][0] + w1[0][0] + w2[0][0]],[hj + ab[1][0] + w1[1][0] + w2[1][0]],[hk + ab[2][0] + w1[2][0] + w2[2][0]]], //A
        [[hi + ab[0][0] + w1[0][0] - w2[0][0]],[hj + ab[1][0] + w1[1][0] - w2[1][0]],[hk + ab[2][0] + w1[2][0] - w2[2][0]]], //B
        [[hi + ab[0][0] - w1[0][0] - w2[0][0]],[hj + ab[1][0] - w1[1][0] - w2[1][0]],[hk + ab[2][0] - w1[2][0] - w2[2][0]]], //C
        [[hi + ab[0][0] - w1[0][0] + w2[0][0]],[hj + ab[1][0] - w1[1][0] + w2[1][0]],[hk + ab[2][0] - w1[2][0] + w2[2][0]]]  //D
    ];
    arrow.head.faces = arrowhead_faces(arrow);
    arrow.head.centroids = arrowhead_face_centroids(arrow);
    arrow.text = {};
    arrow.text.location = [[tl[0][0] + ti],[tl[1][0] + tj],[tl[2][0] + tk]];
    //arrow.text.text = document.getElementById("vector_name").value;
    arrow.text.text = vector_name;
    
    arrow_list.push(arrow);
    return(arrow);
}

//Circle required for:
//   - rotation (angular velocity, angular acceleration)
//   - angular momentum
//   - torque
//Made up of:
//   - circular arrow
//   - axis
//   - broken line (to ref. frame)

//points for a circle
//Made up of:
//   - circular arrow
//      - frame:
//         - origin
//         - z axis normal to plane (arrowhead)
//         - x, y on plane
/*
[
    [xi, yi, zi, t1], //ref: Robotics Vision and Control page 27 (Reading the columns of an orthonormal rotation matrix)
    [xj, yj, zj, t2], //new frame in terms of the inertial frame
    [xk, yk, zk, y3],
    [ 0,  0,  0,  1]
]
*/
//      - radius
//      - total number of segments
//      - start angle
//      - finish angle
//      - line segments on a plane (plane defined by a normal and an origin)
//   - broken line (tail (end), head (start at ref. frame))
var name_cnt = 0;
function create_circle(normal,origin,radius,total,start,finish,direction){
    var debug = 0;
    
    var o = origin;
    
    var points_on_circumference = [];
    
    var hi = normal.head[0][0];
    var hj = normal.head[1][0];
    var hk = normal.head[2][0];
    var ti = normal.tail[0][0];
    var tj = normal.tail[1][0];
    var tk = normal.tail[2][0];
    
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
    
    for(var i=0;i<=total;i=i+1){
        name_cnt = name_cnt + 1;
        var T = hlao.matrix_multiplication(
            hlao.matrix_multiplication(
                new_frame,
                mcht.trotz(direction*(start + (finish - start)*i/total))),
            mcht.transl(radius,0.0,0.0)
        );
        points_on_circumference.push(
            {
                frame: new_frame,
                location: [[T[0][3]],[T[1][3]],[T[2][3]]],
                camera_view: hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),[[T[0][3]],[T[1][3]],[T[2][3]],[1.0]]),
                name: name_cnt.toString()
            }
        );
    }
    
    return(points_on_circumference);
}

export {
    arrow_list,
    arrowhead_faces,
    arrowhead_face_centroids,
    create_arrow,
    create_circle
};