const ReactDOM = require('react-dom/server');
const React = require('react');
const path = require('path');
const fs = require('fs');
const { Article: ArticleComponent } = require('template');

class Article {
    data() {
        return {
            templateEngineOverride: "11ty.js, md",
            layout: "html.11ty.js",
        }
    }

    async updateIndex(props) {
        const indexOutputPath = path.join(
            path.dirname(
                path.dirname(
                    props.page.outputPath
                )
            ),
            "index.html"
        );
        const content = await this.renderFile('./_includes/index.11ty.js', { ...props });
        const wrapper = await this.renderFile('./_includes/html.11ty.js', { ...props, content })
        fs.writeFileSync(indexOutputPath, wrapper);
    }

    async render(props) {
        await this.updateIndex(props);
        return ReactDOM.renderToStaticMarkup(React.createElement(ArticleComponent, props));
    }
}

module.exports = Article;