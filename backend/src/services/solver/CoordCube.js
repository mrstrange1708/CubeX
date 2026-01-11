/**
 * Coordinate-based model for Rubik's Cube.
 * Converts cubie state into indices for fast table lookups.
 */

class CoordCube {
    constructor(cubie) {
        if (cubie) {
            this.twist = this.getTwist(cubie);
            this.flip = this.getFlip(cubie);
            this.slice = this.getSlice(cubie);
            this.cp = this.getCP(cubie);
            this.udep = this.getUDEP(cubie);
            this.sliceep = this.getSliceEP(cubie);
        }
    }

    // Corner Orientation (Twist) - 3^7 = 2187
    getTwist(cubie) {
        let twist = 0;
        for (let i = 0; i < 7; i++) {
            twist = 3 * twist + cubie.co[i];
        }
        return twist;
    }

    // Edge Orientation (Flip) - 2^11 = 2048
    getFlip(cubie) {
        let flip = 0;
        for (let i = 0; i < 11; i++) {
            flip = 2 * flip + cubie.eo[i];
        }
        return flip;
    }

    // Slice position (UD-slice edges position) - 12C4 = 495
    getSlice(cubie) {
        let slice = 0;
        let x = 1;
        for (let i = 0; i < 12; i++) {
            if (cubie.ep[i] >= 8 && cubie.ep[i] <= 11) {
                slice += this.C(i, x);
                x++;
            }
        }
        return 494 - slice;
    }

    // Corner Permutation (CP) - 8! = 40320
    getCP(cubie) {
        let cp = 0;
        for (let i = 0; i < 7; i++) {
            let fact = 1;
            for (let j = 1; j <= 7 - i; j++) fact *= j;
            let count = 0;
            for (let j = i + 1; j < 8; j++) {
                if (cubie.cp[j] < cubie.cp[i]) count++;
            }
            cp += count * fact;
        }
        return cp;
    }

    // U/D-layer Edge Permutation (UD_EP) - 8! = 40320
    getUDEP(cubie) {
        let ep = 0;
        for (let i = 0; i < 7; i++) {
            let fact = 1;
            for (let j = 1; j <= 7 - i; j++) fact *= j;
            let count = 0;
            for (let j = i + 1; j < 8; j++) {
                if (cubie.ep[j] < cubie.ep[i]) count++;
            }
            ep += count * fact;
        }
        return ep;
    }

    // Mid-slice Edge Permutation (Slice_EP) - 4! = 24
    getSliceEP(cubie) {
        let ep = 0;
        for (let i = 8; i < 11; i++) {
            let fact = 1;
            for (let j = 1; j <= 11 - i; j++) fact *= j;
            let count = 0;
            for (let j = i + 1; j < 12; j++) {
                if (cubie.ep[j] < cubie.ep[i]) count++;
            }
            ep += count * fact;
        }
        return ep;
    }

    C(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }
}

module.exports = CoordCube;
