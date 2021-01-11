//This module is required to determine the order of layers to generate in view.

//ECMAScript module

function triangle_centroid(face){
    var A = face[0]; //point A
    var B = face[1];
    var C = face[2];
    var cx = (A[0][0] + B[0][0] + C[0][0])/3.0;
    var cy = (A[1][0] + B[1][0] + C[1][0])/3.0;
    var cz = (A[2][0] + B[2][0] + C[2][0])/3.0;
    return([[cx],[cy],[cz]]);
}

function square_centroid(face){
    var A = face[0]; //point A
    var B = face[1];
    var C = face[2];
    var D = face[3];
    var cx = (A[0][0] + B[0][0] + C[0][0] + D[0][0])/4.0;
    var cy = (A[1][0] + B[1][0] + C[1][0] + D[1][0])/4.0;
    var cz = (A[2][0] + B[2][0] + C[2][0] + D[2][0])/4.0;
    return([[cx],[cy],[cz]]);
}

function octant_centroid(points,name){
    var N = points.length;
    var x_sum = 0.0; var y_sum = 0.0; var z_sum = 0.0;
    for(var i=0;i<N;i=i+1){
        x_sum = x_sum + points[i].camera_view[0][0]; //x
        y_sum = y_sum + points[i].camera_view[1][0]; //y
        z_sum = z_sum + points[i].camera_view[2][0]; //z
    }
    return(
        {
            frame: 'undefined',
            location: 'undefined',
            camera_view: [[x_sum/N],[y_sum/N],[z_sum/N],[1.0]],
            name: name
        }
    );
}

export {
    triangle_centroid,
    square_centroid,
    octant_centroid
};