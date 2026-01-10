// Constants for indexing
const CORNER_POSITIONS = ['ULF', 'ULB', 'URF', 'URB', 'DLF', 'DLB', 'DRF', 'DRB'];
const EDGE_POSITIONS = ['UL', 'UB', 'UR', 'UF', 'DL', 'DB', 'DR', 'DF', 'FL', 'FR', 'BL', 'BR'];

// Helper to clone state
const cloneState = (state) => ({
    corners: state.corners.map(c => ({ ...c })),
    edges: state.edges.map(e => ({ ...e }))
});

class Cube {
    constructor(initialState) {
        if (initialState) {
            this.state = cloneState(initialState);
        } else {
            // Solved state
            // Corners: 0-7, Orientation 0
            // Edges: 0-11, Orientation 0
            this.state = {
                corners: Array.from({ length: 8 }, (_, i) => ({ id: i, orientation: 0 })),
                edges: Array.from({ length: 12 }, (_, i) => ({ id: i, orientation: 0 }))
            };
        }
    }

    // --- Move Logic ---
    // Applying a move returns a NEW Cube instance (immutability)
    move(moveStr) {
        const newCube = new Cube(this.state);
        // Parse move (e.g., "R", "R'", "R2")
        const face = moveStr[0];
        const modifier = moveStr.length > 1 ? moveStr[1] : '';

        let times = 1;
        if (modifier === '2') times = 2;
        else if (modifier === "'") times = 3; // 3 right turns = 1 left turn

        for (let i = 0; i < times; i++) {
            newCube.applyFaceMove(face);
        }

        return newCube;
    }

    // Applies a single 90-degree clockwise rotation of a face
    applyFaceMove(face) {
        // Definitions of cycles for each face move
        switch (face) {
            case 'U':
                this.cycleCorners([0, 1, 3, 2], 0); // Orientation doesn't change for U
                this.cycleEdges([0, 1, 2, 3], 0);
                break;
            case 'D':
                this.cycleCorners([4, 6, 7, 5], 0);
                this.cycleEdges([4, 7, 6, 5], 0);
                break;
            case 'L':
                this.permuteCorners([0, 4, 5, 1], [1, 2, 1, 2]); // +1, +2 (== -1), +1, +2
                this.permuteEdges([0, 8, 4, 10], [0, 0, 0, 0]);
                break;
            case 'R':
                this.permuteCorners([2, 3, 7, 6], [2, 1, 2, 1]); // -1, +1, -1, +1
                this.permuteEdges([2, 11, 6, 9], [0, 0, 0, 0]);
                break;
            case 'F':
                this.permuteCorners([0, 2, 6, 4], [2, 1, 2, 1]);
                this.permuteEdges([3, 9, 7, 8], [1, 1, 1, 1]); // F flips edges
                break;
            case 'B':
                this.permuteCorners([1, 5, 7, 3], [1, 2, 1, 2]);
                this.permuteEdges([1, 10, 5, 11], [1, 1, 1, 1]); // B flips edges
                break;
        }
    }

    permuteCorners(indices, orientationDeltas) {
        const c = this.state.corners;
        const c0 = { ...c[indices[0]] };
        const c1 = { ...c[indices[1]] };
        const c2 = { ...c[indices[2]] };
        const c3 = { ...c[indices[3]] };

        // 0->1
        c[indices[1]] = c0;
        c[indices[1]].orientation = (c[indices[1]].orientation + orientationDeltas[0]) % 3;

        // 1->2
        c[indices[2]] = c1;
        c[indices[2]].orientation = (c[indices[2]].orientation + orientationDeltas[1]) % 3;

        // 2->3
        c[indices[3]] = c2;
        c[indices[3]].orientation = (c[indices[3]].orientation + orientationDeltas[2]) % 3;

        // 3->0
        c[indices[0]] = c3;
        c[indices[0]].orientation = (c[indices[0]].orientation + orientationDeltas[3]) % 3;
    }

    permuteEdges(indices, orientationDeltas) {
        const e = this.state.edges;
        const e0 = { ...e[indices[0]] };
        const e1 = { ...e[indices[1]] };
        const e2 = { ...e[indices[2]] };
        const e3 = { ...e[indices[3]] };

        e[indices[1]] = e0;
        e[indices[1]].orientation = (e[indices[1]].orientation + orientationDeltas[0]) % 2;

        e[indices[2]] = e1;
        e[indices[2]].orientation = (e[indices[2]].orientation + orientationDeltas[1]) % 2;

        e[indices[3]] = e2;
        e[indices[3]].orientation = (e[indices[3]].orientation + orientationDeltas[2]) % 2;

        e[indices[0]] = e3;
        e[indices[0]].orientation = (e[indices[0]].orientation + orientationDeltas[3]) % 2;
    }

    cycleCorners(indices, orientationChange) {
        this.permuteCorners(indices, [orientationChange, orientationChange, orientationChange, orientationChange]);
    }

    cycleEdges(indices, orientationChange) {
        this.permuteEdges(indices, [orientationChange, orientationChange, orientationChange, orientationChange]);
    }

    findEdge(edgeId) {
        for (let i = 0; i < 12; i++) {
            if (this.state.edges[i].id === edgeId) {
                return { position: i, orientation: this.state.edges[i].orientation };
            }
        }
        return null; // Should not happen in valid cube
    }

    findCorner(cornerId) {
        for (let i = 0; i < 8; i++) {
            if (this.state.corners[i].id === cornerId) {
                return { position: i, orientation: this.state.corners[i].orientation };
            }
        }
        return null;
    }

    getCornerAt(position) {
        return this.state.corners[position];
    }

    getEdgeAt(position) {
        return this.state.edges[position];
    }
}

module.exports = Cube;
