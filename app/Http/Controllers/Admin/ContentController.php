<?php namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AdminController;
use App\Content;
use App\Http\Requests\Admin\ContentRequest;
use App\Resource;
use Datatables;

class ContentController extends AdminController
{
    /**
     * ContentController constructor.
     */
    public function __construct()
    {
        view()->share('type', 'content');
    }

    /**
     * Show a list of all the content posts.
     *
     * @return View
     */
    public function index(Resource $resource)
    {
        session(['resourceId' => $resource->id]);

        $contents = $this->getContents();

        $noSideBar = true;

        // Show the page
        return view('admin.content.index', compact('resource', 'contents', 'noSideBar'));
    }

    /**
     * Show the form for creating a new content.
     *
     * @return Response
     */
    public function create()
    {
        // Show the page
        return view('admin.content.create_edit');
    }

    /**
     * Store a newly created content in storage.
     *
     * @return Response
     */
    public function store(ContentRequest $request)
    {
        $content = new Content($request->all());

        $content->resourceId = session('resourceId');

        $content->save();
    }

    /**
     * Edit content
     *
     * @param Content $content
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($contentId)
    {
        $content = Content::findOrFail($contentId);

        return view('admin.content.create_edit', compact('content'));
    }

    /**
     * Update the specified content in storage.
     *
     * @param  int $id
     * @return Response
     */
    public function update(ContentRequest $request)
    {
        $content = Content::findOrFail($request->get('id'));

        $content->update($request->all());
    }

    /**
     * Remove the specified content from storage.
     *
     * @param $id
     * @return Response
     */

    public function delete($contentId)
    {
        $content = Content::findOrFail($contentId);

        return view('admin.content.delete', compact('content'));
    }

    /**
     * Remove the specified content from storage.
     *
     * @param $id
     * @return Response
     */
    public function destroy($contentId)
    {
        $content = Content::findOrFail($contentId);

        $content->delete();
    }

    /**
     * Get all contents
     *
     * @return array
     */
    public function getContents()
    {
        return Content::where('resourceId', session('resourceId'))
            ->orderBy('seq', 'ASC')
            ->get()
            ->map(function ($content) {
                return [
                    'id' => $content->id,
                    'seq' => $content->seq,
                    'title' => $content->title,
                    'created_at' => $content->created_at->format('d/m/Y'),
                ];
            });
    }

    /**
     * Show a list of all the content posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $contents = $this->getContents(true);

        return Datatables::of($contents)
            ->add_column('actions', '<a href="{{{ url(\'admin/content/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm iframe" ><span
class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                <a href="{{{ url(\'admin/content/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger iframe"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                <input type="hidden" name="row" value="{{$id}}" id="row">')
            ->remove_column('id')
            ->make();
    }
}
