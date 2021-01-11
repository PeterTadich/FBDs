//This module is required to change view of the observer perspective.

//npm install https://github.com/PeterTadich/matrix-computations

//ECMAScript module

import * as hlao from 'matrix-computations';
import * as mcht from 'homogeneous-transformations';
//import * as hlao from './modules/hlao.mjs';
//import * as mcht from './modules/mcht.mjs';

import * as vectors from './vectors.mjs';
import * as kinematics from './kinematics.mjs';

//camera frame
var camera_frame = {};
camera_frame.description = "Camera Frame";
camera_frame.homogeneous_transformation = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];
//screen correction
camera_frame.homogeneous_transformation = hlao.matrix_multiplication(                            //third  - rotation about Y
    hlao.matrix_multiplication(                                                                  //second - rotation about Z
        hlao.matrix_multiplication(camera_frame.homogeneous_transformation,mcht.transl(0.0,0.0,0.0)), //first  - translation
        mcht.trotz(Math.PI)
    ),
    mcht.troty(Math.PI)
);
/*
//no correction
camera_frame.homogeneous_transformation = hlao.matrix_multiplication(                            //third  - rotation about Y
    hlao.matrix_multiplication(                                                                  //second - rotation about Z
        hlao.matrix_multiplication(camera_frame.homogeneous_transformation,mcht.transl(0.0,0.0,0.0)), //first  - translation
        mcht.trotz(0.0)
    ),
    mcht.troty(0.0)
);
*/
camera_frame.frame_name = "{C}";
camera_frame.coord_names = ["X","Y","Z"];
camera_frame.camera_view = hlao.matrix_multiplication(mcht.HTInverse(camera_frame.homogeneous_transformation),camera_frame.homogeneous_transformation); //identity matrix
//frame_list.push(camera_frame);

function cameraTracking(){
    //update camera homogeneous transformation
    camera_frame.homogeneous_transformation = hlao.matrix_multiplication(camera_frame.homogeneous_transformation,mcht.trotx(Math.random()/10)); //rotation about local axis
    camera_frame.homogeneous_transformation = hlao.matrix_multiplication(camera_frame.homogeneous_transformation,mcht.troty(Math.random()/10)); //rotation about local axis
    camera_frame.homogeneous_transformation = hlao.matrix_multiplication(camera_frame.homogeneous_transformation,mcht.trotz(Math.random()/10)); //rotation about local axis
}

//update all geometry with '.camera_view' property
function updateCamera(){
    //   - points
    updateCamera_points();
    //   - rotation vectors
    updateCamera_RotationVectors();
    //   - vectors
    updateCamera_Vectors();
    //   - frames
    updateCamera_Frames();
}

//points camera update
function updateCamera_points(){
    for(var i=0;i<vectors.point_list.length;i=i+1){
        vectors.point_list[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [
                [vectors.point_list[i].location[0][0]],
                [vectors.point_list[i].location[1][0]],
                [vectors.point_list[i].location[2][0]],
                [1.0]
            ]
        );
    }
    //      - plot the points
    //plot_points();
}

//vectors camera update
function updateCamera_Vectors(){
    for(var i=0;i<vectors.vector_list.length;i=i+1){
        //tail
        vectors.vector_list[i].camera_view.tail = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [
                [vectors.vector_list[i].tail[0][0]],
                [vectors.vector_list[i].tail[1][0]],
                [vectors.vector_list[i].tail[2][0]],
                [1.0]]
        );
        //head
        vectors.vector_list[i].camera_view.head = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [
                [vectors.vector_list[i].head[0][0]],
                [vectors.vector_list[i].head[1][0]],
                [vectors.vector_list[i].head[2][0]],
                [1.0]]
        );
    }
    //      - plot the vectors
    //plot_vectors();
}

//rotation vectors camera update
function updateCamera_RotationVectors(){
    //   - roation vectors
    for(var j=0;j<vectors.rotation_list.length;j=j+1){
        //   - update broken line (head, tail)
        vectors.rotation_list[j].broken_line.camera_view.tail = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].broken_line.tail[0][0]],[vectors.rotation_list[j].broken_line.tail[1][0]],[vectors.rotation_list[j].broken_line.tail[2][0]],[1.0]]
        );
        vectors.rotation_list[j].broken_line.camera_view.head = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].broken_line.head[0][0]],[vectors.rotation_list[j].broken_line.head[1][0]],[vectors.rotation_list[j].broken_line.head[2][0]],[1.0]]
        );
        //   - update broken line points
        for(var i=0;i<vectors.rotation_list[j].broken_line.camera_view.points.length;i=i+1){
            vectors.rotation_list[j].broken_line.camera_view.points[i] = hlao.matrix_multiplication(
                mcht.HTInverse(camera_frame.homogeneous_transformation),
                [[vectors.rotation_list[j].broken_line.points[i][0][0]],[vectors.rotation_list[j].broken_line.points[i][1][0]],[vectors.rotation_list[j].broken_line.points[i][2][0]],[1.0]]
            );
        }
        //   - update circular points
        for(var i=0;i<vectors.rotation_list[j].circular_arrow.line_segments.border_points.length;i=i+1){
            vectors.rotation_list[j].circular_arrow.line_segments.border_points[i].camera_view = hlao.matrix_multiplication(
                mcht.HTInverse(camera_frame.homogeneous_transformation),
                [
                    [vectors.rotation_list[j].circular_arrow.line_segments.border_points[i].location[0][0]],
                    [vectors.rotation_list[j].circular_arrow.line_segments.border_points[i].location[1][0]],
                    [vectors.rotation_list[j].circular_arrow.line_segments.border_points[i].location[2][0]],
                    [1.0]
                ]
            );
        }
        //   - rotation vector (broken line arrowhead)
        vectors.rotation_list[j].arrowhead.camera_view.tail = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].arrowhead.tail[0][0]],[vectors.rotation_list[j].arrowhead.tail[1][0]],[vectors.rotation_list[j].arrowhead.tail[2][0]],[1.0]]
        );
        vectors.rotation_list[j].arrowhead.camera_view.head = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].arrowhead.head[0][0]],[vectors.rotation_list[j].arrowhead.head[1][0]],[vectors.rotation_list[j].arrowhead.head[2][0]],[1.0]]
        );
        //   - rotation vector (circular line arrowhead)
        vectors.rotation_list[j].circular_arrow.arrowhead.camera_view.tail = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].circular_arrow.arrowhead.tail[0][0]],[vectors.rotation_list[j].circular_arrow.arrowhead.tail[1][0]],[vectors.rotation_list[j].circular_arrow.arrowhead.tail[2][0]],[1.0]]
        );
        vectors.rotation_list[j].circular_arrow.arrowhead.camera_view.head = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            [[vectors.rotation_list[j].circular_arrow.arrowhead.head[0][0]],[vectors.rotation_list[j].circular_arrow.arrowhead.head[1][0]],[vectors.rotation_list[j].circular_arrow.arrowhead.head[2][0]],[1.0]]
        );
    }
    //      - plot rotation vectors
    //plot_rotation_vectors();
}

//frames camera update
function updateCamera_Frames(){
    for(var i=0;i<kinematics.frame_list.length;i=i+1){
        kinematics.frame_list[i].camera_view = hlao.matrix_multiplication(
            mcht.HTInverse(camera_frame.homogeneous_transformation),
            kinematics.frame_list[i].homogeneous_transformation
        );
    }
    //      - plot the frames
    //plot_frames();
}

export {
    camera_frame,
    cameraTracking,
    updateCamera,
    updateCamera_points,
    updateCamera_Vectors,
    updateCamera_RotationVectors,
    updateCamera_Frames
};