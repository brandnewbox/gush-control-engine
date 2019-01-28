this.Graph = class Graph {
  constructor(canvas_id) {
    this.canvas = `#${canvas_id}`;
    this.digraph = new dagreD3.Digraph;
  }

  populate(nodes, links) {
    nodes.forEach(node => {
      return this.digraph.addNode(node.name, {
        finished: !!node.finished_at,
        failed: !!node.failed_at,
        running: !!node.started_at,
        enqueued: !!node.enqueued_at,
        label: node.klass
      }
      );
    });

    return links.forEach(edge => {
      return this.digraph.addEdge(null, edge.source, edge.target);
    });
  }

  render() {
    const renderer = new dagreD3.Renderer;
    const layout = dagreD3.layout().nodeSep(50).rankDir("LR");
    const oldDrawNodes = renderer.drawNodes();

    renderer.drawNodes((graph, root) => {
      const svgNodes = oldDrawNodes(graph, root);
      svgNodes.attr("data-job-name", name => {
        return name;
      });

      svgNodes.attr("class", name => {
        const node = this.digraph.node(name);
        let classes = `node ${name.replace(/::/g, '_').toLowerCase()}`;
        if (node.failed) {
          classes += " status-failed";
        } else if (node.finished) {
          classes += " status-finished";
        } else if (node.running) {
          classes += " status-running";
        } else if (node.enqueued) {
          classes += " status-enqueued";
        }
        return classes;
      });

      return svgNodes;
  }).layout(layout)
    .run(this.digraph, d3.select(`${this.canvas} g`));
    return this.panZoom();
  }

  panZoom() {
    return svgPanZoom(this.canvas, {
      panEnabled: true,
      minZoom: 0.8,
      maxZoom: 10,
      zoomEnabled: true,
      center: false,
      fit: true
    }
    );
  }

  markNode(name, class_names) {
   name = name.replace(/::/g, '_').toLowerCase();
   return $(`svg${this.canvas} .node.${name}`)
     .attr('class', `node ${name} ${class_names}`);
 }
};
