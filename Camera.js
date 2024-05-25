class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0,.3,0+5]);
        this.at = new Vector3([0,.3,-1+5]);
        this.up = new Vector3([0,1,0]);
        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projMat = new Matrix4().setPerspective(
            this.fov,
            canvas.width / canvas.height,
            0.1, 1000
        );

        this.speed = 2/100;
        this.alpha = 2;
        this.x_curr = 0;
        this.y_curr = 0;
    }

    moveForward() {
        var forward_v = new Vector3(this.at.elements);
        forward_v.sub(this.eye);
        forward_v.normalize();
        forward_v.mul(this.speed)
        this.eye.add(forward_v);
        this.at.add(forward_v);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveBackward() {
        var backward_v = new Vector3(this.eye.elements);
        backward_v.sub(this.at);
        backward_v.normalize();
        backward_v.mul(this.speed)

        this.eye.add(backward_v);
        this.at.add(backward_v);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveLeft() {
        var forward_v = new Vector3().set(this.at);
        forward_v.sub(this.eye);
        forward_v.normalize();

        var left_v = Vector3.cross(this.up, forward_v);
        left_v.normalize();
        left_v.mul(this.speed);

        this.eye.add(left_v);
        this.at.add(left_v);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveRight() {
        var forward_v = new Vector3().set(this.at);
        forward_v.sub(this.eye);
        forward_v.normalize();

        var left_v = Vector3.cross(this.up, forward_v);
        left_v.normalize();
        left_v.mul(this.speed);

        this.eye.sub(left_v);
        this.at.sub(left_v);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panLeft() {
        var forward_v = new Vector3().set(this.at);
        forward_v.sub(this.eye);
        forward_v.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(forward_v);

        this.at = new Vector3(this.eye.elements)
        this.at.add(f_prime);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panRight() {
        var forward_v = new Vector3().set(this.at);
        forward_v.sub(this.eye);
        forward_v.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(forward_v);

        this.at = new Vector3(this.eye.elements)
        this.at.add(f_prime);

        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    onMove = (ev) => {

        // get mouse coords
        let [x, y] = convertCoordinatesEventToGL(ev);

        // get forward vector
        var forward_v = new Vector3().set(this.at);
        forward_v.sub(this.eye);
        forward_v.normalize();

        // get turn angle by subtracting previous x from curr x
        let alpha = (this.x_curr - x)*100;

        // get rotated vector
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(forward_v);

        this.at = new Vector3(this.eye.elements)
        this.at.add(f_prime);
    
        // update
        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        // set curr x and y
        this.x_curr = x;
    }

    updateCamera() {
        // update
        this.viewMat = new Matrix4().setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
}