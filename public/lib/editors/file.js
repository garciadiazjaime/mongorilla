(function() {

    /**
     * Backbone Forms File editor
     * @requires fancy-file
     */
    Backbone.Form.editors.File = Backbone.Form.editors.Base.extend({

        tagName: 'div',
        
        defaultValue: '',
        
        initialize: function(options) {
            this.$el.addClass('control-group');
            this.value = this.model.get(options.key);
            //this._dayLabels = options.schema.dayLabels;
            //this._dayPeriodLabels = options.schema.dayPeriodLabels;

            // taken from: https://developer.mozilla.org/en-US/docs/Web/API/FileReader?redirectlocale=en-US&redirectslug=DOM%2FFileReader#readAsDataURL%28%29
            this.oFReader = new FileReader();
            this.rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var editor = this;
            this.$el.html(
                '<img src="" class="image-preview img-polaroid" style="width:200px;height:200px;" />' + 
                '<input name="upload" type="file" data-toggle="fancyfile" />' +
                '<div class="progress-container"></div>'
            );
            setTimeout(function () { // once appended to the DOM
                $('[type="file"]', editor.$el).fancyfile({
                    text  : 'Uplaod',
                    icon  : '',
                    style : 'btn-info',
                    placeholder : 'Select File…'
                });
            }, 200)
            if (this.value) {
                $('.image-preview', this.$el).attr('src', '/api/fs.file/' + this.value);
            }
            this.setValue(this.value);
            this._delegateEvents();

            return this;
        },

        _delegateEvents: function () {
            var editor = this;

            editor.oFReader.onload = function (oFREvent) {
                $('.image-preview', editor.$el).attr('src', oFREvent.target.result);
            };
 
            $('[type="file"]', editor.$el).on('change', function (event) {
                if (this.files.length === 0) { return; }
                var oFile = this.files[0];
                // only in the case of images... TODO
                if (!editor.rFilter.test(oFile.type)) { alert("You must select a valid image file!"); return; }

                editor.oFReader.readAsDataURL(oFile);

                //---
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/fs.file');

                xhr.upload.onprogress = function (e) {
                    console.log(e.loaded + ' of ' + e.total);
                    $('.progress-container .bar', editor.$el).css('width', (e.loaded/(e.total||1))*100 + '%');
                };

                xhr.onload = function (xhr) {
                    var response = JSON.parse(arguments[0].currentTarget.response);
                    editor.setValue(response);
                    $('.progress-container', editor.$el).html('');
                };

                var form = new FormData();
                form.append('title', this.files[0].name);
                form.append('picture', this.files[0]);
                xhr.send(form);
                $('.progress-container', editor.$el).html(
                    '<div class="progress progress-striped active">' +
                    '   <div class="bar" style="width:0%;"></div>' +
                    '</div>'
                );
                //---
            });
 
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            // set the file object w/ObjectId
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            // set the file object w/ObjectId
            this.value = value;
        }

    });

}());
