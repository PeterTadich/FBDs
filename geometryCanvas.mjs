//This module is writes geometry to the canvas.

//ECMAScript module

import * as config from './config.mjs';
import * as kinematics from './kinematics.mjs';
import * as vectors from './vectors.mjs';
import * as geom from './geometry.mjs';
import * as cam from './camera.mjs';

function drawImage(){
    plot_points(); //points
    plot_vectors(); //vectors
    plot_rotation_vectors(); //rotation vectors
    plot_frames(); //frames
}

function make_point(point,colour){
    var displayText = 1;
    
    if(typeof colour === "undefined") colour = "black";
    ctx.beginPath();
    ctx.arc((point.camera_view[0][0] + config.width/2), (point.camera_view[1][0] + config.height/2), config.w/2, 0, 2 * Math.PI);
    //'fill' or 'stroke' ref: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
    //ctx.stroke(); 
    ctx.fillStyle = colour;
    ctx.fill();
    //write the text
    if(displayText){
        if(point.name.length !== 0){
            ctx.fillStyle = colour;
            ctx.fillText(point.name, (point.camera_view[0][0] + config.width/2), (point.camera_view[1][0] + config.height/2));
        }
    }
}

function make_rotation(rotation){
    /*
    //circular - plot points
    for(var i=0;i<rotation.circular_arrow.line_segments.border_points.length;i=i+1){
        make_point(rotation.circular_arrow.line_segments.border_points[i]);
    }
    */
    //circular - plot line
    for(var i=0;i<(rotation.circular_arrow.line_segments.border_points.length - 1 - 4);i=i+1){
        ctx.beginPath();
        ctx.moveTo(rotation.circular_arrow.line_segments.border_points[i].camera_view[0][0] + config.width/2, rotation.circular_arrow.line_segments.border_points[i].camera_view[1][0] + config.height/2);
        ctx.lineTo(rotation.circular_arrow.line_segments.border_points[i+1].camera_view[0][0] + config.width/2, rotation.circular_arrow.line_segments.border_points[i+1].camera_view[1][0] + config.height/2);
        ctx.stroke();
    }
    //plot broken line (centre line)
    for(var i=0;i<rotation.broken_line.camera_view.points.length;i=i+2){ //every second point
        ctx.beginPath();
        ctx.moveTo(rotation.broken_line.camera_view.points[i][0][0] + config.width/2, rotation.broken_line.camera_view.points[i][1][0] + config.height/2);
        ctx.lineTo(rotation.broken_line.camera_view.points[i+1][0][0] + config.width/2, rotation.broken_line.camera_view.points[i+1][1][0] + config.height/2);
        ctx.stroke();
    }
    //plot arrowhead
    make_vector(rotation.arrowhead);
}

function plot_circle(points){
    for(var i=0;i<(points.length - 1);i=i+1){
        if(points[i].camera_view[2][0] >= 0.0){
            make_point(points[i]);
            ctx.beginPath();
            ctx.moveTo(points[i].camera_view[0][0] + config.width/2, points[i].camera_view[1][0] + config.height/2);
            ctx.lineTo(points[i+1].camera_view[0][0] + config.width/2, points[i+1].camera_view[1][0] + config.height/2);
            ctx.stroke();
        }
    }
}

function plot_arrow(arrow){
    //The upper-left corner of the canvas has the coordinates (0,0)
    //tail to head - line
    ctx.beginPath();
    ctx.moveTo(arrow.tail.points[0][0][0] + config.width/2, arrow.tail.points[0][1][0] + config.height/2);
    ctx.lineTo(arrow.head.points[0][0][0] + config.width/2, arrow.head.points[0][1][0] + config.height/2);
    ctx.stroke();

    //head - triangle (square)
    var ix;
    for(var i=0;i<arrow.head.centroids.length;i=i+1){
        ix = arrow.head.centroids[i].ix;                
        ctx.beginPath();
        ctx.moveTo(arrow.head.faces[ix][0][0][0] + config.width/2, arrow.head.faces[ix][0][1][0] + config.height/2);
        ctx.lineTo(arrow.head.faces[ix][1][0][0] + config.width/2, arrow.head.faces[ix][1][1][0] + config.height/2);
        ctx.lineTo(arrow.head.faces[ix][2][0][0] + config.width/2, arrow.head.faces[ix][2][1][0] + config.height/2);
        if(arrow.head.faces[ix].length > 3) ctx.lineTo(arrow.head.faces[ix][3][0][0] + config.width/2, arrow.head.faces[ix][3][1][0] + config.height/2); //square
        ctx.closePath();
        ctx.stroke();
        /*
        if(ix == 4) ctx.fillStyle = "red";
        if(ix == 0) ctx.fillStyle = "green";
        if(ix == 1) ctx.fillStyle = "orange";
        if(ix == 2) ctx.fillStyle = "blue";
        if(ix == 3) ctx.fillStyle = "yellow";
        */
        ctx.fillStyle = "red";
        ctx.fill();
    }
    
    //write the text
    ctx.fillStyle = "black";
    ctx.fillText(arrow.text.text, (arrow.text.location[0][0] + config.width/2), (arrow.text.location[1][0] + config.height/2));
}

function make_vector(vector){
    var debug = 0;
    
    /*
    var ti = vector.tail[0][0];
    var tj = vector.tail[1][0];
    var tk = vector.tail[2][0];
    var hi = vector.head[0][0];
    var hj = vector.head[1][0];
    var hk = vector.head[2][0];
    */
    var ti = vector.camera_view.tail[0][0];
    var tj = vector.camera_view.tail[1][0];
    var tk = vector.camera_view.tail[2][0];
    var hi = vector.camera_view.head[0][0];
    var hj = vector.camera_view.head[1][0];
    var hk = vector.camera_view.head[2][0];
    
    var tail = [ti,tj,tk]; var head = [hi,hj,hk];
    
    //tail
    /*
    document.getElementById("ti").value = ti;
    document.getElementById("tj").value = tj;
    document.getElementById("tk").value = tk;
    */
    if(debug === 1) console.log("tail: [[" + ti + "],[" + tj + "],[" + tk + "]]");
    //head
    /*
    document.getElementById("hi").value = hi;
    document.getElementById("hj").value = hj;
    document.getElementById("hk").value = hk;
    */
    if(debug === 1) console.log("head: [[" + hi + "],[" + hj + "],[" + hk + "]]");
    //name
    //document.getElementById("vector_name").value = vector.name;
    var arrow = geom.create_arrow(tail,head,vector.name);
    plot_arrow(arrow);
}

function draw_frame(frame){
    var debug = 0;
    
    //var T = frame.homogeneous_transformation;
    var T = frame.camera_view;
    
    if(debug === 1) console.log("Plotting frame: " + frame.description);
    
    //x axis
    /*
    //tail
    document.getElementById("ti").value = T[0][3];
    document.getElementById("tj").value = T[1][3];
    document.getElementById("tk").value = T[2][3];
    //head
    document.getElementById("hi").value = T[0][3] + T[0][0] * config.axis_scale;
    document.getElementById("hj").value = T[1][3] + T[1][0] * config.axis_scale;
    document.getElementById("hk").value = T[2][3] + T[2][0] * config.axis_scale;
    //axis name
    document.getElementById("vector_name").value = frame.coord_names[0];
    */
    var tail = [T[0][3],T[1][3],T[2][3]];
    var head = [(T[0][3] + T[0][0] * config.axis_scale),(T[1][3] + T[1][0] * config.axis_scale),(T[2][3] + T[2][0] * config.axis_scale)];
    var arrow = geom.create_arrow(tail,head,frame.coord_names[0]);
    plot_arrow(arrow);
    
    //y axis
    //tail
    /*
    document.getElementById("ti").value = T[0][3];
    document.getElementById("tj").value = T[1][3];
    document.getElementById("tk").value = T[2][3];
    //head
    document.getElementById("hi").value = T[0][3] + T[0][1] * config.axis_scale;
    document.getElementById("hj").value = T[1][3] + T[1][1] * config.axis_scale;
    document.getElementById("hk").value = T[2][3] + T[2][1] * config.axis_scale;
    //axis name
    document.getElementById("vector_name").value = frame.coord_names[1];
    */
    var tail = [T[0][3],T[1][3],T[2][3]];
    var head = [(T[0][3] + T[0][1] * config.axis_scale),(T[1][3] + T[1][1] * config.axis_scale),(T[2][3] + T[2][1] * config.axis_scale)];
    var arrow = geom.create_arrow(tail,head,frame.coord_names[1]);
    plot_arrow(arrow);
    
    //z axis
    //tail
    /*
    document.getElementById("ti").value = T[0][3];
    document.getElementById("tj").value = T[1][3];
    document.getElementById("tk").value = T[2][3];
    //head
    document.getElementById("hi").value = T[0][3] + T[0][2] * config.axis_scale;
    document.getElementById("hj").value = T[1][3] + T[1][2] * config.axis_scale;
    document.getElementById("hk").value = T[2][3] + T[2][2] * config.axis_scale;
    //axis name
    document.getElementById("vector_name").value = frame.coord_names[2];
    */
    var tail = [T[0][3],T[1][3],T[2][3]];
    var head = [(T[0][3] + T[0][2] * config.axis_scale),(T[1][3] + T[1][2] * config.axis_scale),(T[2][3] + T[2][2] * config.axis_scale)];
    var arrow = geom.create_arrow(tail,head,frame.coord_names[2]);
    plot_arrow(arrow);
    
    //origin
    //point
    ctx.beginPath();
    ctx.arc((T[0][3] + config.width/2), (T[1][3] + config.height/2), config.w/2, 0, 2 * Math.PI);
    //'fill' or 'stroke' ref: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
    //ctx.stroke(); 
    ctx.fill();
    //write the text
    ctx.fillStyle = "black";
    ctx.fillText(frame.frame_name, (T[0][3] + config.width/2), (T[1][3] + config.height/2));
}

function plot_camera_frame(){
    draw_frame(camera_frame);
}

function plot_frames(){
    for(var i=0;i<kinematics.frame_list.length;i=i+1){
        draw_frame(kinematics.frame_list[i]);
    }
}

function plot_rotation_vectors(){
    for(var i=0;i<vectors.rotation_list.length;i=i+1){
        make_rotation(vectors.rotation_list[i]);
    }
}

function plot_vectors(){
    for(var i=0;i<vectors.vector_list.length;i=i+1){
        make_vector(vectors.vector_list[i]);
    }
}

function plot_points(){
    for(var i=0;i<vectors.point_list.length;i=i+1){
        make_point(vectors.point_list[i]);
    }
}

export {
    drawImage,
    make_point,
    make_rotation,
    plot_circle,
    plot_arrow,
    make_vector,
    draw_frame,
    plot_camera_frame,
    plot_frames,
    plot_rotation_vectors,
    plot_vectors,
    plot_points
};