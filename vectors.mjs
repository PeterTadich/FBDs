//This module is required to support vectors.
//types of vectors
//   - kinematics
//      - translation
//         - position vector
//         - velocity
//         - acceleration
//      - rotation
//         - angular velocity
//         - angular acceleration
//   - kinetics
//      - linear momentum
//      - angular momentum
//      - generalised forces
//         - torque
//         - force

//npm install https://github.com/PeterTadich/matrix-computations

//ECMAScript module

//import * as hlao from 'matrix-computations';
//import * as mcht from 'homogeneous-transformations';
import * as hlao from './modules/hlao.mjs';
import * as mcht from './modules/mcht.mjs';
import * as geom from './geometry.mjs';
import * as cam from './camera.mjs';

//store points
//   - location (row vector)
//   - name
//   - camera view
var point_list = [];

//store vectors
var vector_list = [];

//store rotation vectors
var rotation_list = [];

function createPositionVector(start, end, name){
    var ms; var ns; var me; var ne;
    
    [ms, ns] = [start.length, start[0].length];
    [me, ne] = [end.length, end[0].length];
    var testCase = ms.toString() + ns.toString() + me.toString() + ne.toString();
    
    switch(testCase){
        //two points
        case '1313': //1 x 3, 1 x 3 (two row vectors)
            var tail = [[start[0]], [start[1]], [start[2]]];
            var head = [[end[0]], [end[1]], [end[2]]];
            break;
        
        case '1331': //1 x 3, 3 x 1 (row, column vectors)
            var tail = [[start[0]], [start[1]], [start[2]]];
            var head = [[end[0][0]], [end[1][0]], [end[2][0]]];
            break;
        
        case '3113': //3 x 1, 1 x 3 (column, row vectors)
            var tail = [[start[0][0]], [start[1][0]], [start[2][0]]];
            var head = [[end[0]], [end[1]], [end[2]]];
            break;
        
        case '3131': //3 x 1, 3 x 1 (two column vectors)
            var tail = [[start[0][0]], [start[1][0]], [start[2][0]]];
            var head = [[end[0][0]], [end[1][0]], [end[2][0]]];
            break;
        
        case '4444': //4 x 4, 4 x 4
            //two frames
            var tail = [[start[0][3]], [start[1][3]], [start[2][3]]];
            var head = [[end[0][3]], [end[1][3]], [end[2][3]]];
            break;
        
        case '4413': //4 x 4, 1 x 3 (frame, row vector)
            //break;
            
        case '4431': //4 x 4, 3 x 1 (frame, column vector)
            //break;
            
        //etc
        
        case '13': //start point and a free vector
            //break;
        
        default:
            console.log("WARNING: unknown 'case' in 'createPositionVector()'" + testCase);
            var tail = [[0.0], [0.0], [0.0]];
            var head = [[1.0], [0.0], [0.0]]; //default 'x' direction
            var name = 'default';
            break;
    }
    
    //rA/O
    var rAO = {};
    rAO.tail = tail;
    rAO.head = head;
    rAO.name = name;
    rAO.camera_view = {};
    rAO.camera_view.tail = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),[[rAO.tail[0][0]],[rAO.tail[1][0]],[rAO.tail[2][0]],[1.0]]);
    rAO.camera_view.head = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),[[rAO.head[0][0]],[rAO.head[1][0]],[rAO.head[2][0]],[1.0]]);
    vector_list.push(rAO);
}

//createPoint([[75.0],[5.0],[0.0]], "A");
function createPoint(refData, name){
    var m; var n;
    [m, n] = [refData.length, refData[0].length];
    var testCase = m.toString() + n.toString();
    
    switch(testCase){
        case '13':
            //coordinate
            //   - m x n = 1 x 3 (row vector)
            var coordinate = [[refData[0]], [refData[1]], [refData[2]]];
            break;
        
        case '31':
            //coordinate
            //   - m x n = 3 x 1 (column vector)
            var coordinate = [[refData[0][0]], [refData[1][0]], [refData[2][0]]];
            break;
        
        case '44':
            //   frame (homogenous transform)
            //   - m x n = 4 x 4
            var coordinate = [[refData[0][3]], [refData[1][3]], [refData[2][3]]];
            break;
        
        default:
            console.log("WARNING: unknown 'case' in 'createPoint()'" + testCase);
            var coordinate = [[0.0], [0.0], [0.0]];
            var name = 'default';
            break;
    }
    
    var point = {};
    point.location = coordinate;
    point.name = name;
    point.camera_view = hlao.matrix_multiplication(mcht.HTInverse(cam.camera_frame.homogeneous_transformation),[[point.location[0][0]],[point.location[1][0]],[point.location[2][0]],[1.0]]);
    point_list.push(point);
}

//create rotation vector:
//   Made up of:
//      - circular arrow
//         - frame:
//            - origin
//            - z axis normal to plane (arrowhead)
//            - x, y on plane
//   [
//       [xi, yi, zi, t1], //ref: Robotics Vision and Control page 27 (Reading the columns of an orthonormal rotation matrix)
//       [xj, yj, zj, t2], //new frame in terms of the inertial frame
//       [xk, yk, zk, y3],
//       [ 0,  0,  0,  1]
//   ]
//         - line segments on a plane (plane defined by a normal and an origin)
//            - points
//               - radius
//         - arrowhead
//      - broken line (tail (end), head (start at ref. frame))
//      - ref_frame: ref. frame the rotation vector was created in (required for origin)
//      - length: length of broken line
//      - offset: offset (magnitude) from ref. frame (defined in inertial frame)
//      - number_of_segments: number of segments in broken line
//      - arrow_length: length of the arrow
//example:
/*
bodyFrame();
wrefFrame();
create_rotation_vector(Wref_frame,100.0,[[0.0],[50.0],[0.0]],10,50);
*/
function create_rotation_vector(ref_frame,length,offset,number_of_segments,arrow_length){
    var debug = 0;

    var rotation_vector = {};
    
    //   - circular arrow
    rotation_vector.circular_arrow = {};

    //      - frame
    rotation_vector.circular_arrow.frame = {};
    
    //      - line segments
    rotation_vector.circular_arrow.line_segments = {};
    
    //         - points
    /*
    var normal = {head: [[0.0],[1.0],[0.0]], tail: [[0.0],[0.0],[0.0]]};
    var origin = [[25.0],[50.0 + offset],[0.0]];
    */
    var normal = {
            head: [[ref_frame.homogeneous_transformation[0][2]],[ref_frame.homogeneous_transformation[1][2]],[ref_frame.homogeneous_transformation[2][2]]], //rotation about the 'Z' axis
            tail: [[0.0],[0.0],[0.0]] //may need to fix this
            //tail: [[ref_frame.homogeneous_transformation[0][3]],[ref_frame.homogeneous_transformation[1][3]],[ref_frame.homogeneous_transformation[2][3]]]
        };
    if(debug == 1){
        console.log("rotation normal:");
        console.log("   - head: [[" + normal.head[0][0] + "],[" + normal.head[1][0] + "],[" + normal.head[2][0] + "]]");
        console.log("   - tail: [[" + normal.tail[0][0] + "],[" + normal.tail[1][0] + "],[" + normal.tail[2][0] + "]]");
    }
    var origin = [[ref_frame.homogeneous_transformation[0][3]],[ref_frame.homogeneous_transformation[1][3]],[ref_frame.homogeneous_transformation[2][3]]];
    if(debug == 1){
        console.log("   - origin: [[" + origin[0][0] + "],[" + origin[1][0] + "],[" + origin[2][0] + "]]");
    }
    var radius = 25.0;
    var total = 15;
    var start = 0;
    var finish = 2.0*Math.PI;
    //rotation_vector.circular_arrow.line_segments.border_points = geom.create_circle(normal,origin,radius,total,start,finish,1);
    rotation_vector.circular_arrow.line_segments.border_points = geom.create_circle(
        normal,
        [[ref_frame.homogeneous_transformation[0][3] + offset[0][0]],[ref_frame.homogeneous_transformation[1][3] + offset[1][0]],[ref_frame.homogeneous_transformation[2][3] + offset[2][0]]],
        radius,total,start,finish,1
    );
    //      - arrowhead (circular arrow)
    rotation_vector.circular_arrow.arrowhead = {};
    //         - determine the head/tail
    var number_border_points = rotation_vector.circular_arrow.line_segments.border_points.length;
    //         - first point (head)
    rotation_vector.circular_arrow.arrowhead.head = rotation_vector.circular_arrow.line_segments.border_points[number_border_points - 2].location;
    //         - second point (tail)
    rotation_vector.circular_arrow.arrowhead.tail = rotation_vector.circular_arrow.line_segments.border_points[number_border_points - 1].location;
    rotation_vector.circular_arrow.arrowhead.name = "v";
    rotation_vector.circular_arrow.arrowhead.camera_view = {};
    vector_list.push(rotation_vector.circular_arrow.arrowhead);
    //         - rotation vector (circular line arrowhead) camera
    rotation_vector.circular_arrow.arrowhead.camera_view.tail = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.circular_arrow.arrowhead.tail[0][0]],[rotation_vector.circular_arrow.arrowhead.tail[1][0]],[rotation_vector.circular_arrow.arrowhead.tail[2][0]],[1.0]]
    );
    rotation_vector.circular_arrow.arrowhead.camera_view.head = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.circular_arrow.arrowhead.head[0][0]],[rotation_vector.circular_arrow.arrowhead.head[1][0]],[rotation_vector.circular_arrow.arrowhead.head[2][0]],[1.0]]
    );
    
    //   - broken line
    //      - broken line ends points (tail, head)
    var hi = normal.head[0][0];
    var hj = normal.head[1][0];
    var hk = normal.head[2][0];
    var ti = normal.tail[0][0];
    var tj = normal.tail[1][0];
    var tk = normal.tail[2][0];
    //
    var R = rotation_matrix(hi, hj, hk, ti, tj, tk);
    var uv = R[0];
    var n1 = R[1];
    var n2 = R[2];
    rotation_vector.broken_line = {};
    //rotation_vector.broken_line.tail = [[25.0],[50.0],[0.0]]; //add tail
    rotation_vector.broken_line.tail = origin; //add tail
    rotation_vector.broken_line.head = hlao.matrix_arithmetic(hlao.matrix_multiplication_scalar(uv,length),rotation_vector.broken_line.tail,'+'); //use normal
    rotation_vector.broken_line.camera_view = {};
    rotation_vector.broken_line.camera_view.tail = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.broken_line.tail[0][0]],[rotation_vector.broken_line.tail[1][0]],[rotation_vector.broken_line.tail[2][0]],[1.0]]
    );
    rotation_vector.broken_line.camera_view.head = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.broken_line.head[0][0]],[rotation_vector.broken_line.head[1][0]],[rotation_vector.broken_line.head[2][0]],[1.0]]
    );
    //      - broken line (centre line)
    //         - length (magnitude)
    //         - number of segments
    //           *---*   *---*   *---*   *---*   *---*
    //    point: 0   1   2   3   4   5   6   7   8   9
    var segment_length = length/((number_of_segments * 2) - 1);
    var number_of_points = number_of_segments * 2;
    if(debug == 1) console.log("rotation vector: segment length = " + segment_length + ", number of points = " + number_of_points)
    rotation_vector.broken_line.points = [];
    rotation_vector.broken_line.camera_view.points = [];
    for(var i=0;i<number_of_points;i=i+1){
        var point_offset = hlao.matrix_arithmetic(hlao.matrix_multiplication_scalar(uv,segment_length * i),rotation_vector.broken_line.tail,'+');
        rotation_vector.broken_line.points.push([[ti + point_offset[0][0]],[tj + point_offset[1][0]],[tk + point_offset[2][0]]]);
        rotation_vector.broken_line.camera_view.points.push(
            hlao.matrix_multiplication(
                mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
                [[rotation_vector.broken_line.points[i][0][0]],[rotation_vector.broken_line.points[i][1][0]],[rotation_vector.broken_line.points[i][2][0]],[1.0]]
            )
        );
    }
    //arrowhead (broken line)
    rotation_vector.arrowhead = {};
    rotation_vector.arrowhead.tail = origin;
    rotation_vector.arrowhead.head = hlao.matrix_arithmetic(hlao.matrix_multiplication_scalar(uv,arrow_length),origin,'+'); //use normal
    rotation_vector.arrowhead.name = "w";
    rotation_vector.arrowhead.camera_view = {};
    vector_list.push(rotation_vector.arrowhead);
    //   - rotation vector (broken line arrowhead)
    rotation_vector.arrowhead.camera_view.tail = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.arrowhead.tail[0][0]],[rotation_vector.arrowhead.tail[1][0]],[rotation_vector.arrowhead.tail[2][0]],[1.0]]
    );
    rotation_vector.arrowhead.camera_view.head = hlao.matrix_multiplication(
        mcht.HTInverse(cam.camera_frame.homogeneous_transformation),
        [[rotation_vector.arrowhead.head[0][0]],[rotation_vector.arrowhead.head[1][0]],[rotation_vector.arrowhead.head[2][0]],[1.0]]
    );
    
    rotation_list.push(rotation_vector);
}

//input head (hi, hj, hk), tail (ti, tj, tk)
function rotation_matrix(hi, hj, hk, ti, tj, tk){
    var debug = 0;

    //calc. unit vector
    var di = hi-ti;
    var dj = hj-tj;
    var dk = hk-tk;
    var mag = Math.pow((Math.pow(di,2) + Math.pow(dj,2) + Math.pow(dk,2)),0.5);
    if(debug === 1) console.log("***mag. (original: " + document.getElementById("vector_name").value + "): " + mag);
    var ui = di/mag;
    var uj = dj/mag;
    var uk = dk/mag;
    var uv = [[ui],[uj],[uk]];
    if(debug === 1) console.log("unit vector: [[" + ui + "],[" + uj + "],[" + uk + "]]");
    var mag2 = Math.pow((Math.pow(ui,2) + Math.pow(uj,2) + Math.pow(uk,2)),0.5);
    if(debug === 1) console.log('mag: ' + mag2);
    
    //cross the unit vector with the global z axis unit vector
    var n1 = hlao.vector_cross(uv,[[0.0],[0.0],[1.0]]);
    if(debug === 1) console.log("normal 'first' vector (cross z axis): [[" + n1[0][0] + "],[" + n1[1][0] + "],[" + n1[2][0] + "]]");
    var n1_mag = Math.pow((Math.pow(n1[0][0],2) + Math.pow(n1[1][0],2) + Math.pow(n1[2][0],2)),0.5);
    if(debug === 1) console.log('mag: ' + n1_mag);
    //IMPORTANT: need to fix below (not getting mag. = 1)
    var TOL = 0.95;
    if(n1_mag < TOL){ //IMPORTANT: use a tolerance
        //cross the unit vector with the global y axis unit vector
        var n1 = hlao.vector_cross(uv,[[0.0],[1.0],[0.0]]);
        if(debug === 1) console.log("normal 'first' vector (cross y axis): [[" + n1[0][0] + "],[" + n1[1][0] + "],[" + n1[2][0] + "]]");
        var n1_mag = Math.pow((Math.pow(n1[0][0],2) + Math.pow(n1[1][0],2) + Math.pow(n1[2][0],2)),0.5);
        if(debug === 1) console.log('mag: ' + n1_mag);
    }
    if(n1_mag < TOL){ //IMPORTANT: use a tolerance
        //cross the unit vector with the global x axis unit vector
        var n1 = hlao.vector_cross(uv,[[1.0],[0.0],[0.0]]);
        if(debug === 1) console.log("normal 'first' vector (cross x axis): [[" + n1[0][0] + "],[" + n1[1][0] + "],[" + n1[2][0] + "]]");
        var n1_mag = Math.pow((Math.pow(n1[0][0],2) + Math.pow(n1[1][0],2) + Math.pow(n1[2][0],2)),0.5);
        if(debug === 1) console.log('mag: ' + n1_mag);
    }
    
    //cross the unit vector with the normal with unit vector
    var n2 = hlao.vector_cross(uv,n1);
    if(debug === 1) console.log("normal 'second' vector: [[" + n2[0][0] + "],[" + n2[1][0] + "],[" + n2[2][0] + "]]");
    
    //IMPORTANT: need to square-up (normalize) the matrix.
    return(
        [uv, n1, n2]
    );
}

export {
    point_list,
    vector_list,
    rotation_list,
    createPositionVector,
    createPoint,
    create_rotation_vector,
    rotation_matrix
};