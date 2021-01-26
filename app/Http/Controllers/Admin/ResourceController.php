<?php namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AdminController;
use App\Resource;
use App\Language;
use App\Http\Requests\Admin\ResourceRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Template;
use Datatables;

class ResourceController extends AdminController
{
    /**
     * ResourceController constructor.
     */
    public function __construct()
    {
        view()->share('type', 'resource');
    }

    /**
     * Show a list of all the resource posts.
     *
     * @return View
     */
    public function index()
    {
        $resources = $this->getResources();

        // Show the page
        return view('admin.resource.index', compact('resources'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        $templates = Template::lists('name', 'id')->sort()->toArray();
        // Show the page
        return view('admin.resource.create_edit', compact('templates'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(ResourceRequest $request)
    {
        $resource = new Resource($request->all());

        $resource->save();
    }

    public function edit(Resource $resource)
    {
        $templates = Template::lists('name', 'id')->sort()->toArray();

        return view('admin.resource.create_edit', compact('resource', 'templates'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int $id
     * @return Response
     */
    public function update(ResourceRequest $request, Resource $resource)
    {
        $resource->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */

    public function delete(Resource $resource)
    {
        return view('admin.resource.delete', compact('resource'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */
    public function destroy(Resource $resource)
    {
        $resource->delete();
    }

    /**
     * Get all resources
     *
     * @return array
     */
    public function getResources()
    {
        // Including soft-deleted records
        return Resource::withTrashed()
            ->orderBy('seq', 'ASC')
            ->get()
            ->map(function ($resource) {
                return [
                    'id' => $resource->id,
                    'seq' => $resource->seq,
                    'name' => $resource->name,
                    'description' => $resource->description,
                    'template' => isset($resource->template) ? $resource->template->name : "Unknown",
                    'deleted_at' => $resource->deleted_at ? 'Hidden': 'Visible',
                    'created_at' => $resource->created_at->format('d/m/Y'),
                ];
            });
    }

    /**
     * Show a list of all the languages posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $resources = $this->getResources();

        return Datatables::of($resources)
            ->add_column('actions', '<a href="{{{ url(\'admin/resource/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm iframe" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                <a href="{{{ url(\'admin/content/\' . $id . \'/index\' ) }}}" class="btn btn-success btn-sm iframe"><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.contents") }}</a>
                <a href="{{{ url(\'admin/resource/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger iframe"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                <input type="hidden" name="row" value="{{$id}}" id="row">')
            ->remove_column('id')
            ->make();
    }

    /**
     * Examine the request.  If the named image is there move it to local.
     *
     * @param ResourceRequest $request
     * @param string $imageName
     * @return string
     */
    private function moveImage(ResourceRequest $request, $imageName, $image)
    {
        if ($request->hasFile($imageName)) {
            $destinationPath = public_path() . '/appfiles/resource';
            $request->file($imageName)->move($destinationPath, $image);
        }
    }

    /**
     * Examine the request.  If the named image is there convert it to an internal
     * name and return it.
     *
     * @param ResourceRequest $request
     * @param string $imageName
     * @param string $currentImage
     * @return string
     */
    private function getImage(ResourceRequest $request, $imageName, $currentImage = "")
    {
        $image = $currentImage;
        if ($request->hasFile($imageName)) {
            $file = $request->file($imageName);
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $image = sha1($filename . time()) . '.' . $extension;
        }
        return $image;
    }
}
