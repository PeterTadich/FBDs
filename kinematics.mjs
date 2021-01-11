//This module is required to support kinematics.
//For example coordinate frames.

//npm install https://github.com/PeterTadich/matrix-computations

//ECMAScript module

import * as hlao from 'matrix-computations';
import * as mcht from 'homogeneous-transformations';
//import * as hlao from './modules/hlao.mjs';
//import * as mcht from './modules/mcht.mjs';
import * as cam from './camera.mjs';

//store frames
var frame_list = [];

//a.o = [[T[0][3]],[T[1][3]],[T[2][3]]]; //translation
//a.x = [[T[0][0]],[T[1][0]],[T[2][0]]]; //rotation
//a.y = [[T[0][1]],[T[1][1]],[T[2][1]]];
//a.z = [[T[0][2]],[T[1][2]],[T[2][2]]];

//inertial frame
var TO = [ //'O' for Oscar.
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0, 1.0]
];
var inertial_frame = {};
function inertialFrame(){
    inertial_frame.description = "Inertial Frame";
    /*
    var TO = [ //'O' for Oscar.
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    */
    inertial_frame.homogeneous_transformation = TO;
    inertial_frame.frame_name = "{O}";
    inertial_frame.coord_names = ["X","Y","Z"];
    inertial_frame.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),inertial_frame.homogeneous_transformation);
    frame_list.push(inertial_frame);
}

/*
//view
var view = {};
//'CTB' body frame with ref. to camera frame
//'OTC' camera frame with ref. to inertial frame
//'OTB' body frame with ref. to inertial frame
var OTB = B_frame.homogeneous_transformation;
var OTC = cam.camera_frame.homogeneous_transformation;
var CTB = hlao.matrix_multiplication(mcht.HTInverse(OTC),OTB);
view.homogeneous_transformation = CTB;
view.frame_name = "{V}";
view.coord_names = ["X","Y","Z"];
frame_list.push(view);
*/

//{B} frame (body frame)
var B_frame = {};
function bodyFrame(){
    B_frame.description = "Body Frame";
    var TB = hlao.matrix_multiplication(hlao.matrix_multiplication(TO,mcht.transl(125,55.0,0.0)),mcht.trotz(Math.PI/8));
    B_frame.homogeneous_transformation = TB;
    B_frame.frame_name = "{B}";
    B_frame.coord_names = ["x","y","z"];
    B_frame.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),B_frame.homogeneous_transformation);
    frame_list.push(B_frame);
}

//{Wref} frame for w (omega) (angular velocity)
var Wref_frame = {};
function wrefFrame(){
    Wref_frame.description = "Wref Frame";
    Wref_frame.homogeneous_transformation = hlao.matrix_multiplication(
        hlao.matrix_multiplication(
            B_frame.homogeneous_transformation,
            mcht.trotz(-1.0*Math.PI/4)),
            mcht.trotx(-1.0*Math.PI/2)
    );
    Wref_frame.frame_name = "{Wref}";
    Wref_frame.coord_names = ["x","y","z"];
    Wref_frame.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),Wref_frame.homogeneous_transformation);
    frame_list.push(Wref_frame);
}

//circle 3 frame
var cir3_frame = {};
function cir3Frame(){
    cir3_frame.description = "circle 3 frame";
    var uv = [[-1],[0],[0]];
    var n1 = [[0],[1],[0]];
    var n2 = [[0],[0],[-1]];
    cir3_frame.homogeneous_transformation =[
        [n1[0][0], n2[0][0], uv[0][0], 0.0],
        [n1[1][0], n2[1][0], uv[1][0], 0.0],
        [n1[2][0], n2[2][0], uv[2][0], 0.0],
        [     0.0,      0.0,      0.0, 1.0]
    ];
    cir3_frame.frame_name = "{C3}";
    cir3_frame.coord_names = ["x","y","z"];
    cir3_frame.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),cir3_frame.homogeneous_transformation);
    frame_list.push(cir3_frame);
}

function createFrame(frameDetails){
    var FrameConstruct = {};

    FrameConstruct.description = frameDetails.description;
    FrameConstruct.homogeneous_transformation = frameDetails.homogeneous_transformation;
    FrameConstruct.frame_name = frameDetails.frameName;
    FrameConstruct.coord_names = frameDetails.coordNames;
    FrameConstruct.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),FrameConstruct.homogeneous_transformation);
    frame_list.push(FrameConstruct);
}

export {
    frame_list,
    inertial_frame,
    inertialFrame,
    B_frame,
    bodyFrame,
    Wref_frame,
    wrefFrame,
    cir3_frame,
    cir3Frame,
    createFrame
};