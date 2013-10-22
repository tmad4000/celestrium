define ["jquery", "underscore", "backbone", "d3", "core/selectionLayer"], ($, _, Backbone, d3, SelectionLayer) ->
    GraphView = Backbone.View.extend(
        initialize: ->
            @model.on "change", @update.bind(this)
            _.extend this, Backbone.Events

        render: ->
            initialWindowWidth = $(window).width()
            initialWindowHeight = $(window).height()
            @force = d3.layout.force().size([initialWindowWidth, initialWindowHeight])
            svg = d3.select(@el).append("svg:svg").attr("pointer-events", "all")
            zoom = d3.behavior.zoom()

            # outermost wrapper - this is used to capture all zoom events
            zoomCapture = svg.append("g")

            # this is in the background to capture events not on any node
            # should be added first so appended nodes appear above this
            zoomCapture.append("svg:rect")
                       .attr("width", "100%")
                       .attr("height", "100%")
                       .style("fill-opacity", "0%")

            # lock infrastracture to ignore zoom changes that would
            # typically occur when dragging a node
            translateLock = false
            currentZoom = undefined
            @force.drag().on("dragstart", ->
                translateLock = true
                currentZoom = zoom.translate()
            ).on("dragend", ->
                zoom.translate currentZoom
                translateLock = false
            )


            # add event listener to actually affect UI

            # ignore zoom event if it's due to a node being dragged

            # otherwise, translate and scale according to zoom
            zoomCapture.call(zoom.on("zoom", -> # ignore double click to zoom
                return  if translateLock
                workspace.attr "transform", "translate(#{d3.event.translate}) scale(#{d3.event.scale})"
            )).on("dblclick.zoom", null)

            # inner workspace which nodes and links go on
            # scaling and transforming are abstracted away from this
            workspace = zoomCapture.append("svg:g")

            # containers to house nodes and links
            # so that nodes always appear above links
            linkContainer = workspace.append("svg:g").classed("linkContainer", true)
            nodeContainer = workspace.append("svg:g").classed("nodeContainer", true)
            selectionLayer = new SelectionLayer(parent: @el)
            return this

        update: ->
            nodes = @model.get("nodes")
            links = @model.get("links")
            @force.nodes(nodes).links(links).start()
            link = @linkSelection = d3.select(@el).select(".linkContainer").selectAll(".link").data(links, @model.get("linkHash"))
            linkEnter = link.enter().append("line").attr("class", "link")
            link.exit().remove()
            node = @nodeSelection = d3.select(@el).select(".nodeContainer").selectAll(".node").data(nodes, @model.get("nodeHash"))
            nodeEnter = node.enter().append("g").attr("class", "node").call(@force.drag)
            nodeEnter.append("text")
                     .attr("dx", 12)
                     .attr("dy", ".35em")
                     .text((d) ->
                        d.text
                    )

            nodeEnter.append("circle")
                     .attr("r", 5)
                     .attr("cx", 0)
                     .attr("cy", 0)

            @trigger "enter:node", nodeEnter
            @trigger "enter:link", linkEnter
            node.exit().remove()
            @force.on "tick", ->
                link.attr("x1", (d) ->
                    d.source.x
                ).attr("y1", (d) ->
                    d.source.y
                ).attr("x2", (d) ->
                    d.target.x
                ).attr("y2", (d) ->
                    d.target.y
                )

                node.attr "transform", (d) ->
                    "translate(#{d.x},#{d.y})"



        getNodeSelection: ->
            return @nodeSelection

        getLinkSelection: ->
            return @linkSelection

        getForceLayout: ->
            return @force
    )
    return GraphView